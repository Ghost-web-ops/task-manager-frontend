"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, FormEvent } from 'react';
import { CardData, ListData } from './types';
import { Card } from './Card';
import { useAuth } from '@/context/AuthContext';

interface ListProps {
  list: ListData;
  onAddCard: (listId: string, newCard: CardData) => void;
}

export function List({ list, onAddCard }: ListProps) {
  const { setNodeRef } = useDroppable({ id: list.id, data: { type: 'List' } });
  const [newCardTitle, setNewCardTitle] = useState('');
  const { token } = useAuth();

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

  return (
   <div ref={setNodeRef} className="flex flex-col flex-shrink-0 w-72 h-fit max-h-full p-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow">
    <h2 className="p-2 mb-2 font-bold text-gray-800 dark:text-gray-200">{list.title}</h2>
      <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {list.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
      <form onSubmit={handleCreateCard} className="mt-2">
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