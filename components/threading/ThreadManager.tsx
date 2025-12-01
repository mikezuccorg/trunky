'use client';

import { Thread } from '@/types';
import { ThreadPane } from './ThreadPane';

interface ThreadManagerProps {
  threads: Thread[];
  mainThreadId: string;
  apiKey: string;
  onUpdateThread: (thread: Thread) => void;
  onCloseThread: (threadId: string) => void;
  onTextSelect: (text: string, messageId: string, threadId: string) => void;
  allThreads?: Thread[]; // All threads for finding child thread selections
  onNavigateToThread?: (threadId: string) => void;
}

export function ThreadManager({
  threads,
  mainThreadId,
  apiKey,
  onUpdateThread,
  onCloseThread,
  onTextSelect,
  allThreads = [],
  onNavigateToThread,
}: ThreadManagerProps) {
  // Show only 2 threads: parent (left) and current (right)
  // This creates a clear hierarchical view
  const visibleThreads = threads.slice(0, 2);
  const threadCount = visibleThreads.length;

  // Get child threads for each visible thread
  const getChildThreads = (threadId: string, allThreads: Thread[]): Thread[] => {
    return allThreads.filter((t) => t.parentThreadId === threadId);
  };

  return (
    <div className="flex h-full w-full">
      {visibleThreads.map((thread, index) => {
        const isCurrent = index === visibleThreads.length - 1;

        return (
          <div
            key={thread.id}
            className="flex-1"
            style={{
              minWidth: `${100 / threadCount}%`,
              maxWidth: `${100 / threadCount}%`,
            }}
          >
            <ThreadPane
              thread={thread}
              apiKey={apiKey}
              isMainThread={thread.id === mainThreadId}
              onUpdateThread={onUpdateThread}
              onClose={
                isCurrent && thread.id !== mainThreadId
                  ? () => onCloseThread(thread.id)
                  : undefined
              }
              onTextSelect={onTextSelect}
              childThreads={getChildThreads(thread.id, threads)}
              allThreads={allThreads}
              onNavigateToThread={onNavigateToThread}
            />
          </div>
        );
      })}
    </div>
  );
}
