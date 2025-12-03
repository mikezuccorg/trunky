'use client';

import { useEffect, useRef, useState } from 'react';
import { Message as MessageType, Thread } from '@/types';
import { Message } from './Message';
import { ThreadMinimap } from './ThreadMinimap';
import { Bot } from 'lucide-react';

interface ThreadSelection {
  threadId: string;
  selectedText: string;
  messageCount: number;
}

interface MessageListProps {
  messages: MessageType[];
  onTextSelect?: (text: string, messageId: string) => void;
  isLoading?: boolean;
  highlightMessageId?: string;
  highlightedText?: string;
  allThreads?: Thread[]; // All threads to find child threads
  onNavigateToThread?: (threadId: string) => void;
}

export function MessageList({ messages, onTextSelect, isLoading, highlightMessageId, highlightedText, allThreads = [], onNavigateToThread }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [messageHeights, setMessageHeights] = useState<Map<string, number>>(new Map());

  // Recursively count messages in a thread and all its children
  const countThreadMessages = (threadId: string): number => {
    const thread = allThreads.find(t => t.id === threadId);
    if (!thread) return 0;

    // Count non-inherited messages in this thread
    const ownMessages = thread.messages.filter(msg => !msg.isInherited).length;

    // Find and count messages from all child threads recursively
    const childThreads = allThreads.filter(t => t.parentThreadId === threadId);
    const childMessagesCount = childThreads.reduce(
      (sum, child) => sum + countThreadMessages(child.id),
      0
    );

    return ownMessages + childMessagesCount;
  };

  useEffect(() => {
    // Only auto-scroll if user isn't selecting text
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Scroll to highlighted message when it exists - instant scroll for thread navigation
  useEffect(() => {
    if (highlightMessageId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  }, [highlightMessageId]);

  // Measure actual DOM heights of messages
  useEffect(() => {
    const measureHeights = () => {
      const newHeights = new Map<string, number>();
      messageRefs.current.forEach((element, messageId) => {
        if (element) {
          newHeights.set(messageId, element.offsetHeight);
        }
      });
      setMessageHeights(newHeights);
    };

    // Measure on mount and when messages change
    measureHeights();

    // Also measure after a short delay to account for dynamic content
    const timer = setTimeout(measureHeights, 100);

    // Measure on resize
    const resizeObserver = new ResizeObserver(measureHeights);
    messageRefs.current.forEach((element) => {
      if (element) resizeObserver.observe(element);
    });

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-text-secondary text-sm">
            Starting a Thread
          </p>
          <p className="text-text-secondary text-xs">
            Select any text to create a threaded conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => {
            const isHighlighted = message.id === highlightMessageId;

            // Find child threads that branch from this message
            const childThreads: ThreadSelection[] = allThreads
              .filter(thread => thread.parentMessageId === message.id)
              .map(thread => ({
                threadId: thread.id,
                selectedText: thread.selectedText || '',
                messageCount: countThreadMessages(thread.id),
              }))
              .filter(thread => thread.selectedText); // Only include threads with selectedText

            return (
              <div
                key={message.id}
                ref={(el) => {
                  if (el) {
                    messageRefs.current.set(message.id, el);
                  }
                  if (isHighlighted && el) {
                    (highlightRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  }
                }}
              >
                <Message
                  message={message}
                  onTextSelect={onTextSelect}
                  isHighlighted={isHighlighted}
                  highlightedText={isHighlighted ? highlightedText : undefined}
                  childThreads={childThreads}
                  onNavigateToThread={onNavigateToThread}
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
                  <span className="text-sm font-medium">Waiting</span>
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
      <ThreadMinimap
        messages={messages}
        containerRef={containerRef}
        allThreads={allThreads}
        highlightMessageId={highlightMessageId}
        highlightedText={highlightedText}
        messageHeights={messageHeights}
      />
    </div>
  );
}
