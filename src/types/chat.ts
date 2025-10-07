export type ChatCategory = 'suporte-tecnico' | 'financeiro' | 'comercial' | 'infra';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  category: ChatCategory;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryConfig {
  id: ChatCategory;
  label: string;
  icon: string;
}
