import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/hooks/useChatStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ChatCategory } from '@/types/chat';
import { CATEGORY_NAMES } from '@/config/webhooks';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Index = () => {
  const { chats, activeChat, loading, userTeam, setActiveChat, createChat, addMessage, getActiveChat, deleteChat, renameChat } = useChatStore();
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = async () => {
    if (!userTeam) return;
    await createChat(userTeam);
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChat) {
      toast({ title: 'Erro', description: 'Crie um chat primeiro', variant: 'destructive' });
      return;
    }

    await addMessage(activeChat, message, 'user');
    setIsLoading(true);

    try {
      const currentChat = getActiveChat();
      const category = currentChat?.category;
      if (!category) throw new Error('Categoria não encontrada');

      // Build conversation history for context
      const conversationMessages = currentChat.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: conversationMessages, category }),
      });

      if (!res.ok) throw new Error('Falha na comunicação com o servidor');
      const data = await res.json();
      const response = data.response;

      await addMessage(activeChat, response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Erro', description: 'Falha ao enviar mensagem. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentChat = getActiveChat();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside className="w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          userTeam={userTeam}
          onChatSelect={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onSignOut={signOut}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <ChatArea messages={currentChat.messages} isLoading={isLoading} chatTitle={currentChat.title} />
            <ChatInput onSendMessage={handleSendMessage} disabled={!activeChat} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-bold text-primary">Bem-vindo à Fios Tecnologia</h2>
              <p className="text-muted-foreground">
                {userTeam
                  ? `Você faz parte do time ${CATEGORY_NAMES[userTeam]}. Clique no botão + para iniciar uma conversa.`
                  : 'Carregando seu perfil...'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
