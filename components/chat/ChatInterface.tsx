'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Thread, ChatSettings as ChatSettingsType } from '@/types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChat } from '@/hooks/useChat';
import { storage } from '@/lib/storage';

interface ChatInterfaceProps {
  thread: Thread;
  apiKey: string;
  onUpdateThread: (thread: Thread) => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
  childThreads?: Thread[]; // Child threads spawned from this thread
}

export function ChatInterface({
  thread,
  apiKey,
  onUpdateThread,
  onTextSelect,
  childThreads = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(thread.messages);
  const [settings, setSettings] = useState<ChatSettingsType>(
    thread.settings || {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
      extendedThinking: false,
    }
  );

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
    settings,
    onMessage: handleMessage,
  });

  // Save messages and settings to thread whenever they change
  useEffect(() => {
    if (messages.length > 0 && messages !== thread.messages) {
      const updatedThread = {
        ...thread,
        messages,
        settings,
      };
      onUpdateThread(updatedThread);
    }
  }, [messages, settings, thread, onUpdateThread]);

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

  // Find which messages should be highlighted (if any child threads reference them)
  const getHighlightForMessage = (messageId: string) => {
    const childThread = childThreads.find(
      (t) => t.parentMessageId === messageId && t.parentThreadId === thread.id
    );
    return childThread
      ? { highlightedText: childThread.selectedText || '' }
      : null;
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
