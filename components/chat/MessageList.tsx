'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { Message } from './Message';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  onTextSelect?: (text: string, messageId: string) => void;
  isLoading?: boolean;
}

export function MessageList({ messages, onTextSelect, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-text-secondary text-sm">
            Start a conversation with Claude
          </p>
          <p className="text-text-secondary text-xs">
            Select any text to create a threaded conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onTextSelect={onTextSelect}
          />
        ))}
        {isLoading && (
          <div className="px-6 py-6 bg-assistant-message">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-3 text-text-primary">
                  <Bot size={18} className="lucide lucide-bot" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Claude</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
