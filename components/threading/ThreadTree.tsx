'use client';

import { Thread } from '@/types';
import { truncateText, formatTimestamp } from '@/lib/utils';

interface ThreadTreeProps {
  threads: Thread[];
  mainThreadId: string;
  currentThreadId: string;
  onNavigate: (threadId: string) => void;
  onClose: () => void;
}

interface ThreadWithDepth {
  thread: Thread;
  depth: number;
}

export function ThreadTree({ threads, mainThreadId, currentThreadId, onNavigate, onClose }: ThreadTreeProps) {
  // Get the complete hierarchy including all nodes in the tree
  const getCompleteThreadHierarchy = (): ThreadWithDepth[] => {
    const result: ThreadWithDepth[] = [];
    const addedIds = new Set<string>();

    // Step 1: Traverse up to get the path to root
    const pathToRoot: Thread[] = [];
    let currentThread = threads.find(t => t.id === currentThreadId);

    while (currentThread) {
      pathToRoot.unshift(currentThread); // Add to beginning to maintain order from root to current
      if (currentThread.parentThreadId) {
        currentThread = threads.find(t => t.id === currentThread!.parentThreadId);
      } else {
        currentThread = undefined;
      }
    }

    // Step 2: Recursively add thread and all its descendants
    const addThreadAndDescendants = (threadId: string, depth: number) => {
      const children = threads.filter(t => t.parentThreadId === threadId);

      children.forEach(child => {
        if (!addedIds.has(child.id)) {
          result.push({ thread: child, depth });
          addedIds.add(child.id);
          addThreadAndDescendants(child.id, depth + 1);
        }
      });
    };

    // Step 3: Add root and all its children
    if (pathToRoot.length > 0) {
      const root = pathToRoot[0];
      result.push({ thread: root, depth: 0 });
      addedIds.add(root.id);
      addThreadAndDescendants(root.id, 1);
    }

    return result;
  };

  const threadHierarchy = getCompleteThreadHierarchy();

  if (threadHierarchy.length === 0) {
    return null;
  }

  return (
    <div className="fixed left-4 top-20 w-80 bg-white dark:bg-surface border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold">Thread Hierarchy</h3>
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

      <div className="flex-1 overflow-y-auto">
        {threadHierarchy.map(({ thread, depth }, index) => {
          const isCurrent = thread.id === currentThreadId;
          const isRoot = thread.parentThreadId === null;

          return (
            <button
              key={thread.id}
              onClick={() => {
                onNavigate(thread.id);
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors border-b border-border/50 ${
                isCurrent
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-l-2 border-l-orange-500'
                  : 'hover:bg-surface-2 border-l-2 border-l-transparent'
              }`}
              style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
              <div className="flex-1 min-w-0 text-left">
                <div className={`text-xs line-clamp-1 ${isCurrent ? 'font-semibold text-orange-900 dark:text-orange-300' : 'text-text-primary'}`}>
                  {thread.selectedText
                    ? truncateText(thread.selectedText, 60)
                    : isRoot
                    ? 'Main Thread'
                    : 'Thread'}
                </div>
              </div>

              <div className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                isCurrent
                  ? 'bg-orange-500 text-white'
                  : 'bg-surface-3 text-text-secondary'
              }`}>
                {thread.messages.length}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-border bg-surface text-xs text-text-secondary">
        {threadHierarchy.length} thread{threadHierarchy.length !== 1 ? 's' : ''} · {threadHierarchy.reduce((sum, { thread }) => sum + thread.messages.length, 0)} total messages
      </div>
    </div>
  );
}
