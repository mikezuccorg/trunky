'use client';

import { Thread } from '@/types';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { X, ChevronLeft } from 'lucide-react';
import { getThreadTitle } from '@/lib/utils';

interface ThreadPaneProps {
  thread: Thread;
  apiKey: string;
  isMainThread: boolean;
  onUpdateThread: (thread: Thread) => void;
  onClose?: () => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
}

export function ThreadPane({
  thread,
  apiKey,
  isMainThread,
  onUpdateThread,
  onClose,
  onTextSelect,
}: ThreadPaneProps) {
  return (
    <div className="flex flex-col h-full border-r border-border last:border-r-0 animate-in slide-in-from-right duration-300">
      {/* Thread header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!isMainThread && thread.parentThreadId && (
            <ChevronLeft size={16} className="text-text-secondary flex-shrink-0" />
          )}
          <h3 className="text-sm font-medium truncate">
            {isMainThread ? 'Main Thread' : getThreadTitle(thread.selectedText)}
          </h3>
        </div>

        {!isMainThread && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-surface-3 rounded transition-colors"
            aria-label="Close thread"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Chat interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          thread={thread}
          apiKey={apiKey}
          onUpdateThread={onUpdateThread}
          onTextSelect={onTextSelect}
        />
      </div>
    </div>
  );
}
