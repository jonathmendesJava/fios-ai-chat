import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Chat, ChatCategory, Message } from '@/types/chat';

export function useChatStore() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!user) { setChats([]); setLoading(false); return; }

    const { data: chatsData, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (chatsError) {
      console.error('Error loading chats:', chatsError);
      setLoading(false);
      return;
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (messagesError) console.error('Error loading messages:', messagesError);

    const messagesByChat = (messagesData || []).reduce((acc: Record<string, Message[]>, msg) => {
      if (!acc[msg.chat_id]) acc[msg.chat_id] = [];
      acc[msg.chat_id].push(msg as Message);
      return acc;
    }, {});

    const fullChats: Chat[] = (chatsData || []).map(chat => ({
      ...chat,
      category: chat.category as ChatCategory,
      messages: messagesByChat[chat.id] || [],
    }));

    setChats(fullChats);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setChats(prev => prev.map(chat => {
          if (chat.id === newMsg.chat_id) {
            if (chat.messages.some(m => m.id === newMsg.id)) return chat;
            return { ...chat, messages: [...chat.messages, newMsg] };
          }
          return chat;
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const createChat = async (category: ChatCategory): Promise<string> => {
    if (!user) return '';
    const { data, error } = await supabase
      .from('chats')
      .insert({ category, title: 'Nova conversa', user_id: user.id })
      .select()
      .single();

    if (error || !data) { console.error('Error creating chat:', error); return ''; }

    const newChat: Chat = { ...data, category: data.category as ChatCategory, messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(data.id);
    return data.id;
  };

  const addMessage = async (chatId: string, content: string, role: 'user' | 'assistant') => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, content, role })
      .select()
      .single();

    if (error || !data) { console.error('Error adding message:', error); return; }

    const newMsg = data as Message;
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const hasMsg = chat.messages.some(m => m.id === newMsg.id);
        const updatedMessages = hasMsg ? chat.messages : [...chat.messages, newMsg];
        const title = chat.messages.length === 0 && role === 'user'
          ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
          : chat.title;
        if (title !== chat.title) {
          supabase.from('chats').update({ title }).eq('id', chatId).then();
        }
        return { ...chat, title, messages: updatedMessages, updated_at: new Date().toISOString() };
      }
      return chat;
    }));
  };

  const getActiveChat = (): Chat | null => chats.find(chat => chat.id === activeChat) || null;

  const deleteChat = async (chatId: string) => {
    const { error } = await supabase.from('chats').delete().eq('id', chatId);
    if (error) { console.error('Error deleting chat:', error); return; }
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) setActiveChat(null);
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    const { error } = await supabase.from('chats').update({ title: newTitle }).eq('id', chatId);
    if (error) { console.error('Error renaming chat:', error); return; }
    setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat));
  };

  // User's team category
  const userTeam = profile?.team || null;

  return {
    chats,
    activeChat,
    loading,
    userTeam,
    setActiveChat,
    createChat,
    addMessage,
    getActiveChat,
    deleteChat,
    renameChat,
  };
}
