export interface CardData {
  id: string;
  title: string;
  order: number;
  list_id: string;
  description?: string;
}

export interface ListData {
  id: string;
  title: string;
  order: number;
  cards: CardData[];
}