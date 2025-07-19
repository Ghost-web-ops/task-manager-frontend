"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { CardData, ListData } from './types';
import { Card } from './Card';
import { useAuth } from '@/context/AuthContext';
import { Edit, Trash2, Save, X} from 'lucide-react';

interface ListProps {
  list: ListData;
  onAddCard: (listId: string, newCard: CardData) => void;
  onUpdateCard: (cardId: string, data: { title?: string }) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateList: (listId: string, newTitle: string) => void;
  onDeleteList: (listId: string) => void;
}

export function List({ list, onAddCard, onUpdateCard, onDeleteCard, onUpdateList, onDeleteList }: ListProps) {
  // ✅ All state and helper functions MUST be INSIDE the component
  const { setNodeRef } = useDroppable({ id: list.id, data: { type: 'List' } });
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(list.title);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);
  
  const handleCreateCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
        body: JSON.stringify({ title: newCardTitle, list_id: list.id, order: list.cards.length }),
      });
      if (!res.ok) throw new Error('Failed to create card');
      const newCard = await res.json();
      onAddCard(list.id, newCard);
      setNewCardTitle('');
    } catch (error) { console.error(error); }
  };
  
  const handleSaveListTitle = () => {
    if (editingTitle.trim() && editingTitle !== list.title) {
      onUpdateList(list.id, editingTitle);
    }
    setIsEditing(false);
  };

 
return (
    <div ref={setNodeRef} className="flex flex-col flex-shrink-0 w-72 h-fit max-h-full p-2 bg-gray-200 rounded-lg shadow dark:bg-gray-800">
      <div className="flex justify-between items-center p-2 mb-2">
        {isEditing ? (
          <div className='flex items-center gap-2 w-full'>
            <input
              ref={editInputRef}
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveListTitle()}
              className="w-full font-bold bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            />
            <div className="flex items-center">
                <button onClick={handleSaveListTitle} className="p-1 text-green-600 hover:text-green-500"><Save size={18} /></button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-red-600 hover:text-red-500"><X size={18} /></button>
            </div>
          </div>
        ) : (
          <h2 className="font-bold text-gray-800 dark:text-gray-200">{list.title}</h2>
        )}
        <div className="flex items-center gap-1">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16} /></button>
          )}
          <button onClick={() => onDeleteList(list.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
      </div>
      
      {/* The rest of the component (SortableContext, form for adding a card) remains the same */}
      <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-1 overflow-y-auto">
          {list.cards.map(card => (
            <Card key={card.id} card={card} onUpdateCard={onUpdateCard} onDeleteCard={onDeleteCard} />
          ))}
        </div>
      </SortableContext>
      <form onSubmit={handleCreateCard} className="p-1 mt-2">
        <input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="+ Add a card"
          className="w-full px-2 py-1 border-none rounded-md dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
}