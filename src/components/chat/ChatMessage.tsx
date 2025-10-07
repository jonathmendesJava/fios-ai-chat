import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContent = (content: string) => {
    // Basic URL detection and linking
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        'flex gap-3 max-w-3xl group animate-fade-in',
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      )}
    >
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          'rounded-2xl px-4 py-3 backdrop-blur-sm transition-all duration-200 relative',
          message.role === 'user'
            ? 'bg-message-user/90 text-message-user-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5'
            : 'bg-gradient-to-br from-message-ai to-message-ai/80 text-message-ai-foreground shadow-sm hover:shadow-md border border-border/50'
        )}
      >
        <div className="whitespace-pre-wrap break-words">{formatContent(message.content)}</div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs opacity-60">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-foreground" />
        </div>
      )}
    </div>
  );
}
