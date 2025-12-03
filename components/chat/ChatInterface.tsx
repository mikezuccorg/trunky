'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Thread, ChatSettings as ChatSettingsType } from '@/types';
import { FontSettings } from '@/lib/storage';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ResearchProgress } from './ResearchProgress';
import { useChat } from '@/hooks/useChat';
import { storage } from '@/lib/storage';
import { X } from 'lucide-react';

interface ChatInterfaceProps {
  thread: Thread;
  apiKey: string;
  parallelApiKey?: string;
  onUpdateThread: (thread: Thread) => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
  childThreads?: Thread[]; // Child threads spawned from this thread
  onClose?: () => void; // Close button handler for child threads
  allThreads?: Thread[]; // All threads for finding child thread selections
  onNavigateToThread?: (threadId: string) => void;
  fontSettings: FontSettings;
}

export function ChatInterface({
  thread,
  apiKey,
  parallelApiKey,
  onUpdateThread,
  onTextSelect,
  childThreads = [],
  onClose,
  allThreads = [],
  onNavigateToThread,
  fontSettings,
}: ChatInterfaceProps) {
  // Filter out inherited messages from parent threads - users can view them on the left
  const [messages, setMessages] = useState<Message[]>(
    thread.messages.filter(msg => !msg.isInherited)
  );
  const [settings, setSettings] = useState<ChatSettingsType>(
    thread.settings || {
      model: storage.loadLastModel(),
      maxTokens: 4096,
      extendedThinking: false,
      provider: storage.loadLastProvider(),
    }
  );

  // Update messages when thread ID changes (navigating to different thread)
  // Don't sync on messages array changes to prevent clearing user selections
  useEffect(() => {
    // Filter out inherited messages from parent threads
    setMessages(thread.messages.filter(msg => !msg.isInherited));
    setSettings(thread.settings || {
      model: storage.loadLastModel(),
      maxTokens: 4096,
      extendedThinking: false,
      provider: storage.loadLastProvider(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const { sendMessage, isLoading, isResearching, researchProgress, error } = useChat({
    threadId: thread.id,
    apiKey,
    parallelApiKey,
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
    // Save the selected model and provider for future use
    storage.saveLastModel(newSettings.model);
    storage.saveLastProvider(newSettings.provider);
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
        allThreads={allThreads}
        onNavigateToThread={onNavigateToThread}
        fontSettings={fontSettings}
      />

      {/* Research Progress */}
      {isResearching && (
        <ResearchProgress
          progress={researchProgress}
          status={messages[messages.length - 1]?.metadata?.status}
        />
      )}

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
        disabled={isLoading || isResearching}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        hasAnthropicKey={!!apiKey}
        hasParallelKey={!!parallelApiKey}
      />
    </div>
  );
}
