'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { Message } from './Message';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  onTextSelect?: (text: string, messageId: string) => void;
  isLoading?: boolean;
  highlightMessageId?: string;
  highlightedText?: string;
}

export function MessageList({ messages, onTextSelect, isLoading, highlightMessageId, highlightedText }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll if user isn't selecting text
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Scroll to highlighted message when it exists
  useEffect(() => {
    if (highlightMessageId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightMessageId]);

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
        {messages.map((message) => {
          const isHighlighted = message.id === highlightMessageId;
          return (
            <div
              key={message.id}
              ref={isHighlighted ? highlightRef : undefined}
            >
              <Message
                message={message}
                onTextSelect={onTextSelect}
                isHighlighted={isHighlighted}
                highlightedText={isHighlighted ? highlightedText : undefined}
              />
            </div>
          );
        })}
        {isLoading && (
          <div className="px-6 py-6 bg-background">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-surface-3 text-text-primary">
                  <Bot size={14} />
                </div>
                <span className="text-sm font-medium">Claude</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
