import { useState, useEffect } from 'react';
import type { Chat, ChatCategory, Message } from '@/types/chat';

const STORAGE_KEY = 'fios-chats';

export function useChatStore() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Load chats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setChats(parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })));
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  const createChat = (category: ChatCategory): string => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      category,
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    return newChat.id;
  };

  const addMessage = (chatId: string, content: string, role: 'user' | 'assistant') => {
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      role,
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, message];
        // Update title with first user message
        const title = chat.messages.length === 0 && role === 'user'
          ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
          : chat.title;
        
        return {
          ...chat,
          title,
          messages: updatedMessages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  };

  const getActiveChat = (): Chat | null => {
    return chats.find(chat => chat.id === activeChat) || null;
  };

  return {
    chats,
    activeChat,
    setActiveChat,
    createChat,
    addMessage,
    getActiveChat,
  };
}
