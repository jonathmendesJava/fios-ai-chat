import { useState } from 'react';
import { ChevronDown, MessageSquare, Plus, Wrench, DollarSign, Briefcase, Server, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Chat, ChatCategory } from '@/types/chat';
import { DeleteChatDialog } from './DeleteChatDialog';
import { RenameChatDialog } from './RenameChatDialog';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: (category: ChatCategory) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

const categories = [
  { id: 'suporte-tecnico' as ChatCategory, label: 'Suporte Técnico', icon: Wrench },
  { id: 'financeiro' as ChatCategory, label: 'Financeiro', icon: DollarSign },
  { id: 'comercial' as ChatCategory, label: 'Comercial', icon: Briefcase },
  { id: 'infra' as ChatCategory, label: 'Infra', icon: Server },
];

export function ChatSidebar({ chats, activeChat, onChatSelect, onNewChat, onDeleteChat, onRenameChat }: ChatSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ChatCategory>>(
    new Set(categories.map(c => c.id))
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const toggleCategory = (categoryId: ChatCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getCategoryChats = (categoryId: ChatCategory) => {
    return chats.filter(chat => chat.category === categoryId);
  };

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
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map(category => {
            const Icon = category.icon;
            const categoryChats = getCategoryChats(category.id);
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id} className="mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 mr-2 transition-transform',
                        !isExpanded && '-rotate-90'
                      )}
                    />
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{category.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {categoryChats.length}
                    </span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    onClick={() => onNewChat(category.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {isExpanded && categoryChats.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {categoryChats.map(chat => (
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
                )}

                {isExpanded && categoryChats.length === 0 && (
                  <div className="ml-6 mt-1 text-xs text-muted-foreground px-2 py-1">
                    Nenhum chat ainda
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {selectedChat && (
        <>
          <DeleteChatDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            chatTitle={selectedChat.title}
          />
          <RenameChatDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            onConfirm={confirmRename}
            currentTitle={selectedChat.title}
          />
        </>
      )}
    </div>
  );
}
