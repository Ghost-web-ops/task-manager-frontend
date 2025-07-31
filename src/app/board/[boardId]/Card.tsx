"use client";

import { useState, useEffect, useRef,  } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardData } from './types';
import { Edit, Trash2 } from 'lucide-react';

interface CardProps {
  card: CardData;
  isOverlay?: boolean;
  onUpdateCard: (cardId: string, data: { title?: string, description?: string }) => void;
  onDeleteCard: (cardId: string) => void;
}

export function Card({ card, isOverlay, onUpdateCard, onDeleteCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(card.title);
  const editInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (editingTitle.trim() && editingTitle !== card.title) {
        onUpdateCard(card.id, { title: editingTitle });
    }
    setIsEditing(false);
  };

  return (
  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className={`relative p-3 bg-white dark:bg-gray-700 rounded-md shadow group cursor-grab active:cursor-grabbing ${isOverlay ? "ring-2 ring-blue-500" : ""}`}
  >
    {isEditing ? (
      <div className="flex flex-col gap-2">
        <input
          ref={editInputRef}
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full text-sm bg-transparent border-b-2 border-indigo-500 focus:outline-none dark:text-gray-200"
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} className="px-2 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700">
            Save
          </button>
        </div>
      </div>
    ) : (
      <div>
        <p className="text-sm text-gray-900 dark:text-gray-200">{card.title}</p>
        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100  transition-opacity sm:opacity-100">
          <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600">
            <Edit size={14} />
          </button>
          <button onClick={() => onDeleteCard(card.id)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )}
  </div>
);
}