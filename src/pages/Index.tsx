import { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChatStore } from '@/hooks/useChatStore';
import { useToast } from '@/hooks/use-toast';
import type { ChatCategory } from '@/types/chat';
import { WEBHOOK_CONFIGS, CATEGORY_NAMES } from '@/config/webhooks';

const Index = () => {
  const { chats, activeChat, setActiveChat, createChat, addMessage, getActiveChat, deleteChat, renameChat } = useChatStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = (category: ChatCategory) => {
    createChat(category);
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChat) {
      toast({
        title: 'Erro',
        description: 'Selecione ou crie um chat primeiro',
        variant: 'destructive',
      });
      return;
    }

    // Add user message
    addMessage(activeChat, message, 'user');
    setIsLoading(true);

    try {
      // TODO: Integrate with n8n webhook
      // For now, simulate AI response
      const response = await simulateAIResponse(activeChat, message);
      addMessage(activeChat, response, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (chatId: string, message: string): Promise<string> => {
    const currentChat = getActiveChat();
    const category = currentChat?.category;
    
    if (!category) {
      throw new Error('Categoria não encontrada');
    }
    
    const webhookConfig = WEBHOOK_CONFIGS[category];
    
    // Se webhook não está habilitado, retorna mensagem de desenvolvimento
    if (!webhookConfig.enabled) {
      // Simulate delay for typing indicator
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `🚧 O atendimento de ${CATEGORY_NAMES[category]} está em desenvolvimento. Em breve você poderá conversar com nossa IA especializada. Por enquanto, utilize o chat Financeiro. Obrigado pela compreensão!`;
    }
    
    // Faz chamada ao webhook específico da categoria
    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        message,
        category
      })
    });
    
    if (!response.ok) {
      throw new Error('Falha na comunicação com o servidor');
    }
    
    const data = await response.json();
    return data.response;
  };

  const currentChat = getActiveChat();

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside className="w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <ChatArea messages={currentChat.messages} isLoading={isLoading} />
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!activeChat}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-bold text-primary">Bem-vindo à Fios Tecnologia</h2>
              <p className="text-muted-foreground">
                Selecione uma categoria no menu lateral e clique no botão + para iniciar uma nova conversa.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
