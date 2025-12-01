'use client';

import { Thread } from '@/types';
import { truncateText, formatTimestamp } from '@/lib/utils';
import { MessageSquare, FolderOpen } from 'lucide-react';

interface ThreadTreeProps {
  threads: Thread[];
  mainThreadId: string;
  currentThreadId: string;
  onNavigate: (threadId: string) => void;
  onClose: () => void;
}

export function ThreadTree({ threads, mainThreadId, currentThreadId, onNavigate, onClose }: ThreadTreeProps) {
  // Get the complete hierarchy path for the current thread (traverse up to root)
  const getCurrentThreadHierarchy = (): Thread[] => {
    const hierarchy: Thread[] = [];
    let currentThread = threads.find(t => t.id === currentThreadId);

    // Traverse up to collect all parent threads
    while (currentThread) {
      hierarchy.unshift(currentThread); // Add to beginning to maintain order from root to current
      if (currentThread.parentThreadId) {
        currentThread = threads.find(t => t.id === currentThread!.parentThreadId);
      } else {
        currentThread = undefined;
      }
    }

    return hierarchy;
  };

  const threadHierarchy = getCurrentThreadHierarchy();
  const rootThread = threadHierarchy[0]; // First thread in hierarchy is always the root

  if (!rootThread) {
    return null; // No thread hierarchy found
  }

  return (
    <div className="fixed left-4 top-20 w-80 bg-white dark:bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Current Thread Path</h3>
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

      <div className="flex-1 overflow-y-auto p-3">
        {threadHierarchy.map((thread, index) => {
          const isLast = index === threadHierarchy.length - 1;
          const isCurrent = thread.id === currentThreadId;
          const isRoot = thread.parentThreadId === null;

          return (
            <div key={thread.id} className="mb-2">
              <button
                onClick={() => {
                  onNavigate(thread.id);
                  onClose();
                }}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-md transition-colors ${
                  isCurrent
                    ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-700'
                    : 'bg-surface-2 hover:bg-surface-3 border border-transparent'
                }`}
                style={{ paddingLeft: `${index * 12 + 12}px` }}
              >
                {isRoot ? (
                  <FolderOpen size={14} className={`flex-shrink-0 mt-0.5 ${isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-text-secondary'}`} />
                ) : (
                  <MessageSquare size={14} className={`flex-shrink-0 mt-0.5 ${isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-text-secondary'}`} />
                )}

                <div className="flex-1 min-w-0 text-left">
                  <div className={`text-xs line-clamp-2 ${isCurrent ? 'font-semibold text-orange-900 dark:text-orange-300' : 'text-text-primary'}`}>
                    {thread.selectedText
                      ? truncateText(thread.selectedText, 80)
                      : isRoot
                      ? 'Main Thread'
                      : 'Thread'}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-orange-700 dark:text-orange-400' : 'text-text-secondary'}`}>
                    {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                    {' · '}
                    {formatTimestamp(thread.createdAt)}
                  </div>
                </div>
              </button>

              {/* Visual connector to next thread in hierarchy */}
              {!isLast && (
                <div className="flex items-center ml-3" style={{ paddingLeft: `${index * 12 + 12}px` }}>
                  <div className="w-px h-3 bg-border ml-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-secondary">
        {threadHierarchy.length} thread{threadHierarchy.length !== 1 ? 's' : ''} in path
      </div>
    </div>
  );
}
