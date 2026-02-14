export type ChatCategory = 'suporte-tecnico' | 'financeiro' | 'comercial' | 'infra';

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Chat {
  id: string;
  category: ChatCategory;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface CategoryConfig {
  id: ChatCategory;
  label: string;
  icon: string;
}
