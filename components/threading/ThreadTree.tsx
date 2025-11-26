'use client';

import { Thread } from '@/types';
import { getThreadTitle, truncateText } from '@/lib/utils';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface ThreadTreeProps {
  threads: Thread[];
  mainThreadId: string;
  currentThreadId: string;
  onNavigate: (threadId: string) => void;
  onClose: () => void;
}

interface ThreadNodeProps {
  thread: Thread;
  allThreads: Thread[];
  currentThreadId: string;
  onNavigate: (threadId: string) => void;
  level?: number;
}

function ThreadNode({ thread, allThreads, currentThreadId, onNavigate, level = 0 }: ThreadNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const childThreads = allThreads.filter(t => t.parentThreadId === thread.id);
  const hasChildren = childThreads.length > 0;
  const isCurrent = thread.id === currentThreadId;

  return (
    <div className="select-none">
      <div
        className={`flex items-start gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          isCurrent ? 'bg-surface-3 font-medium' : 'hover:bg-surface-2'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onNavigate(thread.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 mt-0.5 hover:bg-surface-3 rounded p-0.5"
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <MessageSquare size={14} className="flex-shrink-0 mt-0.5 text-text-secondary" />

        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-primary line-clamp-1">
            {thread.selectedText
              ? truncateText(thread.selectedText, 60)
              : thread.id === thread.id
              ? 'Main Thread'
              : 'Thread'}
          </div>
          {thread.messages.length > 0 && (
            <div className="text-[10px] text-text-secondary mt-0.5">
              {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childThreads.map((childThread) => (
            <ThreadNode
              key={childThread.id}
              thread={childThread}
              allThreads={allThreads}
              currentThreadId={currentThreadId}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ThreadTree({ threads, mainThreadId, currentThreadId, onNavigate, onClose }: ThreadTreeProps) {
  const mainThread = threads.find(t => t.id === mainThreadId);

  if (!mainThread) return null;

  return (
    <div className="fixed left-4 top-20 w-80 bg-white border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Thread Map</h3>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ThreadNode
          thread={mainThread}
          allThreads={threads}
          currentThreadId={currentThreadId}
          onNavigate={(threadId) => {
            onNavigate(threadId);
            onClose();
          }}
        />
      </div>

      <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-secondary">
        {threads.length} total thread{threads.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
