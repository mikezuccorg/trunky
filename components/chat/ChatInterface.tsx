'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Thread, ChatSettings as ChatSettingsType } from '@/types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChat } from '@/hooks/useChat';
import { X } from 'lucide-react';

interface ChatInterfaceProps {
  thread: Thread;
  apiKey: string;
  onUpdateThread: (thread: Thread) => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
  childThreads?: Thread[]; // Child threads spawned from this thread
  onClose?: () => void; // Close button handler for child threads
}

export function ChatInterface({
  thread,
  apiKey,
  onUpdateThread,
  onTextSelect,
  childThreads = [],
  onClose,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(thread.messages);
  const [settings, setSettings] = useState<ChatSettingsType>(
    thread.settings || {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      extendedThinking: false,
    }
  );

  // Update messages when thread ID changes (navigating to different thread)
  // Don't sync on messages array changes to prevent clearing user selections
  useEffect(() => {
    setMessages(thread.messages);
    setSettings(thread.settings || {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      extendedThinking: false,
    });
  }, [thread.id]); // Only sync when switching threads

  const [isStreaming, setIsStreaming] = useState(false);

  const handleMessage = useCallback(
    (message: Message, streaming: boolean = false) => {
      setIsStreaming(streaming);
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
    settings,
    onMessage: handleMessage,
  });

  // Save messages and settings to thread whenever they change
  // BUT don't update during streaming to prevent infinite re-render loop
  useEffect(() => {
    if (messages.length > 0 && messages !== thread.messages && !isStreaming) {
      const updatedThread = {
        ...thread,
        messages,
        settings,
      };
      onUpdateThread(updatedThread);
    }
  }, [messages, settings, thread, onUpdateThread, isStreaming]);

  const handleSettingsChange = (newSettings: ChatSettingsType) => {
    setSettings(newSettings);
    // Update thread with new settings
    const updatedThread = {
      ...thread,
      settings: newSettings,
    };
    onUpdateThread(updatedThread);
  };

  const handleSend = async (content: string) => {
    await sendMessage(content, messages);
  };

  const handleTextSelect = (text: string, messageId: string) => {
    if (onTextSelect) {
      onTextSelect(text, messageId, thread.id);
    }
  };

  // Find the first child thread to determine highlight (for simplicity, we'll highlight based on first active child)
  const activeChildThread = childThreads[0];
  const highlightInfo = activeChildThread?.parentThreadId === thread.id
    ? {
        messageId: activeChildThread.parentMessageId || undefined,
        text: activeChildThread.selectedText || undefined,
      }
    : {};

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Thread header */}
      {thread.selectedText && (
        <div className="border-b border-border bg-surface px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary mb-1">Thread from:</p>
              <p className="text-sm text-text-primary italic line-clamp-2">
                &quot;{thread.selectedText}&quot;
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-surface-2 rounded transition-colors"
                aria-label="Close thread"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        onTextSelect={handleTextSelect}
        isLoading={isLoading}
        highlightMessageId={highlightInfo.messageId}
        highlightedText={highlightInfo.text}
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
      <InputArea
        onSend={handleSend}
        disabled={isLoading}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
