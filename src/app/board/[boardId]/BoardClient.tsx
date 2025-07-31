"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { List } from './List';
import { Card } from './Card';
import { CardData, ListData } from './types';
import Link from 'next/link';
import {  Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BoardClient({ boardId }: { boardId: string }) {
 const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [lists, setLists] = useState<ListData[]>([]);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  
  const [boardTitle, setBoardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // --- Data Fetching ---
   useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const boardDetailsPromise = fetch(`${apiBaseUrl}/api/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json());

        const listsAndCardsPromise = fetch(`${apiBaseUrl}/api/boards/${boardId}/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json());

        const [boardData, listsData] = await Promise.all([boardDetailsPromise, listsAndCardsPromise]);
        
        setBoardTitle(boardData.title);
        setEditingTitle(boardData.title);
        setLists(listsData);
      } catch (err) {
        console.error("Failed to fetch board data", err);
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) {
      return; // انتظر انتهاء التحقق من المصادقة
    }
    if (!user) {
      router.push('/login'); // إذا لا يوجد مستخدم، اذهب للدخول
    } else {
      fetchData();
    }
  }, [boardId, token, user, authLoading, router, apiBaseUrl]);

  // --- Focus Management ---
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // --- Handlers ---
  const handleUpdateBoardTitle = async () => {
    if (!editingTitle.trim() || editingTitle === boardTitle) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/boards/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (!res.ok) throw new Error('Failed to update board title');
      const updatedBoard = await res.json();
      setBoardTitle(updatedBoard.title);
      setIsEditingTitle(false);
    } catch (error) {
      console.error(error);
      setEditingTitle(boardTitle);
    }
  };

  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !token) return;
    const newOrder = lists.length > 0 ? Math.max(...lists.map(l => l.order)) + 1 : 0;
    try {
      const res = await fetch(`${apiBaseUrl}/api/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newListTitle, board_id: boardId, order: newOrder }),
      });
      if (!res.ok) throw new Error('Failed to create list');
      const newList = await res.json();
      setLists(prev => [...prev, { ...newList, cards: [] }]);
      setNewListTitle('');
    } catch (error) { console.error(error); }
  };

  const handleAddCard = (listId: string, newCard: CardData) => {
    setLists(prev => prev.map(list => 
      list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
    ));
  };
  
  const handleUpdateList = async (listId: string, newTitle: string) => {
    setLists(prev => prev.map(l => l.id === listId ? { ...l, title: newTitle } : l));
    await fetch(`${apiBaseUrl}/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify({ title: newTitle }),
    });
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list and all its cards?')) return;
    setLists(prev => prev.filter(l => l.id !== listId));
    await fetch(`${apiBaseUrl}/api/lists/${listId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`},
    });
  };
  
  const handleUpdateCard = async (cardId: string, data: { title?: string, description?: string }) => {
    setLists(prev => prev.map(l => ({
      ...l,
      cards: l.cards.map(c => c.id === cardId ? { ...c, ...data } : c),
    })));
    await fetch(`${apiBaseUrl}/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify(data),
    });
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    setLists(prev => prev.map(l => ({
      ...l,
      cards: l.cards.filter(c => c.id !== cardId),
    })));
    await fetch(`${apiBaseUrl}/api/cards/${cardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`},
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = lists.flatMap(l => l.cards).find(c => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setLists((prev) => {
      const activeContainerIndex = prev.findIndex(l => l.cards.some(c => c.id === active.id));
      const overContainerIndex = prev.findIndex(l => l.id === over.id || l.cards.some(c => c.id === over.id));

      if (activeContainerIndex === -1 || overContainerIndex === -1) return prev;

      const newLists = JSON.parse(JSON.stringify(prev));
      const activeCardIndex = newLists[activeContainerIndex].cards.findIndex((c: CardData) => c.id === active.id);
      const [movedCard] = newLists[activeContainerIndex].cards.splice(activeCardIndex, 1);

      const overIsListContainer = newLists[overContainerIndex].id === over.id;
      let overCardIndex;
      if (overIsListContainer) {
        overCardIndex = newLists[overContainerIndex].cards.length;
      } else {
        overCardIndex = newLists[overContainerIndex].cards.findIndex((c: CardData) => c.id === over.id);
      }
      
      newLists[overContainerIndex].cards.splice(overCardIndex, 0, movedCard);
      
      fetch(`${apiBaseUrl}/api/cards/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ list_id: newLists[overContainerIndex].id, order: overCardIndex }),
      });
      
      return newLists;
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  if (loading) return <div className="text-center p-10">Loading Board...</div>;

 return (
  <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-100 dark:bg-gray-900">
    <div className="flex items-center justify-between p-4 bg-white shadow-sm dark:bg-gray-800 dark:border-b dark:border-gray-700">
      {isEditingTitle ? (
        <div className="flex items-center flex-grow gap-2">
          <input
            ref={titleInputRef}
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateBoardTitle()}
            className="flex-grow px-2 py-1 text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none dark:text-white"
          />
          <button onClick={handleUpdateBoardTitle} className="p-1 text-green-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            <Save size={20} />
          </button>
          <button onClick={() => setIsEditingTitle(false)} className="p-1 text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline"> &larr; Back to Boards</Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{boardTitle}</h1>
        </div>
      )}
    </div>
    <div className="flex-1 overflow-auto">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 p-4">
          {lists.map((list) => (
            <List
              key={list.id}
              list={list}
              onAddCard={handleAddCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
              onUpdateList={handleUpdateList}
              onDeleteList={handleDeleteList}
            />
          ))}
          <form onSubmit={handleCreateList} className="w-full p-2 bg-gray-300 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="+ Add another list"
              className="w-full px-2 py-1 bg-white border-2 border-transparent rounded-md dark:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
        <DragOverlay>
          {activeCard ? <Card card={activeCard} isOverlay onUpdateCard={() => {}} onDeleteCard={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  </div>
);
}