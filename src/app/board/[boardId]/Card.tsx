"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardData } from './types';

interface CardProps {
  card: CardData;
  isOverlay?: boolean;
}

export function Card({ card, isOverlay }: CardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
       className={`p-3 bg-white dark:bg-gray-700 rounded-md shadow cursor-grab active:cursor-grabbing ${isOverlay ? "ring-2 ring-blue-500" : ""}`}
    >
      <p className="text-gray-900 dark:text-gray-200">{card.title}</p>
    </div>
  );
}