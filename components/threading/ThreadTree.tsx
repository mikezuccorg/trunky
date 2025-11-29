'use client';

import React, { useState } from 'react';
import { Thread } from '@/types';
import { truncateText, formatTimestamp } from '@/lib/utils';
import { ChevronRight, MessageSquare, FolderOpen } from 'lucide-react';

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
              : thread.parentThreadId === null
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
  // Find all root threads (threads with no parent)
  const rootThreads = threads.filter(t => t.parentThreadId === null);

  // Sort root threads by creation time, newest first
  const sortedRootThreads = [...rootThreads].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="fixed left-4 top-20 w-80 bg-white border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Conversations & Threads</h3>
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
        {sortedRootThreads.map((rootThread, index) => {
          const isCurrentRoot = rootThread.id === mainThreadId;
          const childThreads = threads.filter(t => t.parentThreadId === rootThread.id);
          const hasChildren = childThreads.length > 0;

          // Get first user message for title
          const firstUserMessage = rootThread.messages.find(m => m.role === 'user');
          const conversationTitle = firstUserMessage?.content.slice(0, 60) || `Conversation ${sortedRootThreads.length - index}`;

          const [isExpanded, setIsExpanded] = React.useState(true);

          return (
            <div key={rootThread.id} className="mb-3">
              {/* Conversation header - clickable to expand/collapse */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    setIsExpanded(!isExpanded);
                  }
                  onNavigate(rootThread.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-md transition-colors ${
                  isCurrentRoot ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-surface-3'
                }`}
              >
                {hasChildren && (
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                  />
                )}
                {!hasChildren && <div className="w-3.5" />}
                <FolderOpen size={14} className="flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-medium line-clamp-1">
                    {conversationTitle}
                  </div>
                  <div className="text-[10px] opacity-70">
                    {formatTimestamp(rootThread.createdAt)}
                  </div>
                </div>
              </button>

              {/* Child threads only - skip the root thread itself */}
              {hasChildren && isExpanded && (
                <div>
                  {childThreads.map((childThread) => (
                    <ThreadNode
                      key={childThread.id}
                      thread={childThread}
                      allThreads={threads}
                      currentThreadId={currentThreadId}
                      onNavigate={(threadId) => {
                        onNavigate(threadId);
                        onClose();
                      }}
                      level={0}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-secondary">
        {rootThreads.length} conversation{rootThreads.length !== 1 ? 's' : ''} · {threads.length} total thread{threads.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
