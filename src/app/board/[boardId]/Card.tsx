"use client";

import { useState, useEffect, useRef,  } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardData } from './types';
import { Edit, Trash2,  X } from 'lucide-react';

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
        <div className='flex items-center gap-2'>
            <input
                ref={editInputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                onBlur={handleSave}
                className="w-full text-sm bg-transparent focus:outline-none dark:text-gray-200"
            />
             <button onClick={() => setIsEditing(false)} className="p-1 text-red-600 hover:text-red-500"><X size={16} /></button>
        </div>
      ) : (
        <p className="text-sm text-gray-900 dark:text-gray-200">{card.title}</p>
      )}
      
      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600">
          <Edit size={14} />
        </button>
        <button onClick={() => onDeleteCard(card.id)} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}