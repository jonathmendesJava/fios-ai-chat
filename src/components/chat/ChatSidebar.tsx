import { useState } from 'react';
import { MessageSquare, Plus, Wrench, DollarSign, Briefcase, Server, Trash2, Edit2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Chat, ChatCategory } from '@/types/chat';
import { DeleteChatDialog } from './DeleteChatDialog';
import { RenameChatDialog } from './RenameChatDialog';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  userTeam: ChatCategory | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onSignOut: () => void;
}

const categoryMeta: Record<ChatCategory, { label: string; icon: typeof Wrench }> = {
  'suporte-tecnico': { label: 'Suporte Técnico', icon: Wrench },
  'financeiro': { label: 'Financeiro', icon: DollarSign },
  'comercial': { label: 'Comercial', icon: Briefcase },
  'infra': { label: 'Infraestrutura', icon: Server },
};

export function ChatSidebar({ chats, activeChat, userTeam, onChatSelect, onNewChat, onDeleteChat, onRenameChat, onSignOut }: ChatSidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const meta = userTeam ? categoryMeta[userTeam] : null;
  const Icon = meta?.icon || MessageSquare;

  const handleDeleteClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChat(chat);
    setDeleteDialogOpen(true);
  };

  const handleRenameClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChat(chat);
    setRenameDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedChat) {
      onDeleteChat(selectedChat.id);
      setSelectedChat(null);
    }
  };

  const confirmRename = (newTitle: string) => {
    if (selectedChat) {
      onRenameChat(selectedChat.id, newTitle);
      setSelectedChat(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Fios Tecnologia
        </h1>
        {meta && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span>{meta.label}</span>
          </div>
        )}
      </div>

      <div className="p-2 border-b border-sidebar-border">
        <Button
          className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
          variant="ghost"
          onClick={onNewChat}
        >
          <Plus className="w-4 h-4" />
          Nova conversa
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-4 text-center">
              Nenhum chat ainda. Clique em "Nova conversa" para começar.
            </div>
          )}
          {chats.map(chat => (
            <div key={chat.id} className="group relative flex items-center gap-1">
              <Button
                variant="ghost"
                className={cn(
                  'flex-1 justify-start text-sm text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-200',
                  activeChat === chat.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
                onClick={() => onChatSelect(chat.id)}
              >
                <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                <span className="truncate flex-1 text-left">{chat.title}</span>
              </Button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                  onClick={(e) => handleRenameClick(chat, e)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleDeleteClick(chat, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={onSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      {selectedChat && (
        <>
          <DeleteChatDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={confirmDelete} chatTitle={selectedChat.title} />
          <RenameChatDialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen} onConfirm={confirmRename} currentTitle={selectedChat.title} />
        </>
      )}
    </div>
  );
}
