"use client";

import { useState, useEffect,  FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { List } from './List';
import { Card } from './Card';
import { CardData, ListData } from './types';
import Link from 'next/link';


export default function BoardClient({ boardId }: { boardId: string }) {
  const { token } = useAuth();
  const [lists, setLists] = useState<ListData[]>([]);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/boards/${boardId}/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then((data: ListData[]) => setLists(data))
    .catch(err => console.error("Failed to fetch board data", err))
    .finally(() => setLoading(false));
  }, [boardId, token]);


  const handleDragStart = (event: DragEndEvent) => {
    const card = lists.flatMap(l => l.cards).find(c => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setLists((lists) => {
      const originalListIndex = lists.findIndex(l => l.cards.some(c => c.id === activeId));
      const overListIndex = lists.findIndex(l => l.id === over.id || l.cards.some(c => c.id === over.id));

      if (originalListIndex === -1 || overListIndex === -1) return lists;

      const originalCardIndex = lists[originalListIndex].cards.findIndex(c => c.id === activeId);
      
      let overCardIndex;
      if (lists[overListIndex].cards.some(c => c.id === overId)) {
        overCardIndex = lists[overListIndex].cards.findIndex(c => c.id === overId);
      } else {
        overCardIndex = lists[overListIndex].cards.length;
      }
      
      const newLists = [...lists];
      
      if (originalListIndex === overListIndex) {
        // التحريك في نفس القائمة
        newLists[originalListIndex].cards = arrayMove(newLists[originalListIndex].cards, originalCardIndex, overCardIndex);
      } else {
        // التحريك إلى قائمة مختلفة
        const [movedCard] = newLists[originalListIndex].cards.splice(originalCardIndex, 1);
        newLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);
      }

      // إرسال التحديث إلى الخادم
       fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cards/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ list_id: newLists[overListIndex].id, order: overCardIndex }),
      });

      return newLists;
    });
  };
  
  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !token) return;
    const newOrder = lists.length > 0 ? Math.max(...lists.map(l => l.order)) + 1 : 0;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lists`, {
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
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-blue-100 dark:bg-gray-900">
      <div className='p-4 bg-white shadow-sm dark:bg-gray-800 dark:border-b dark:border-gray-700'>
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400"> &larr; Back to Boards</Link>
      </div>
      
      <DndContext 
       sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start h-full gap-4 p-4 overflow-x-auto">
          {lists.map(list => (
            <List key={list.id} list={list} onAddCard={handleAddCard} />
          ))}
          <div className="flex-shrink-0 w-72">
            <form onSubmit={handleCreateList} className="p-2 bg-gray-300 rounded-lg dark:bg-gray-700">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="+ Add another list"
                className="w-full px-2 py-1 bg-white border-2 border-transparent rounded-md dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>
        <DragOverlay>
          {activeCard ? <Card card={activeCard} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}