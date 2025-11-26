'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Thread } from '@/types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChat } from '@/hooks/useChat';
import { storage } from '@/lib/storage';

interface ChatInterfaceProps {
  thread: Thread;
  apiKey: string;
  onUpdateThread: (thread: Thread) => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
}

export function ChatInterface({
  thread,
  apiKey,
  onUpdateThread,
  onTextSelect,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(thread.messages);

  // Update messages when thread changes
  useEffect(() => {
    setMessages(thread.messages);
  }, [thread.messages]);

  const handleMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        // Check if message already exists (for streaming updates)
        const existingIndex = prev.findIndex((m) => m.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message (streaming)
          const newMessages = [...prev];
          newMessages[existingIndex] = message;
          return newMessages;
        } else {
          // Add new message
          return [...prev, message];
        }
      });
    },
    []
  );

  const { sendMessage, isLoading, error } = useChat({
    threadId: thread.id,
    apiKey,
    onMessage: handleMessage,
  });

  // Save messages to thread whenever they change
  useEffect(() => {
    if (messages.length > 0 && messages !== thread.messages) {
      const updatedThread = {
        ...thread,
        messages,
      };
      onUpdateThread(updatedThread);
    }
  }, [messages, thread, onUpdateThread]);

  const handleSend = async (content: string) => {
    await sendMessage(content, messages);
  };

  const handleTextSelect = (text: string, messageId: string) => {
    if (onTextSelect) {
      onTextSelect(text, messageId, thread.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Thread header */}
      {thread.selectedText && (
        <div className="border-b border-border bg-surface px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-text-secondary mb-1">Thread from:</p>
            <p className="text-sm text-text-primary italic line-clamp-2">
              "{thread.selectedText}"
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        onTextSelect={handleTextSelect}
        isLoading={isLoading}
      />

      {/* Error display */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <InputArea onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
