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
}

export function ThreadManager({
  threads,
  mainThreadId,
  apiKey,
  onUpdateThread,
  onCloseThread,
  onTextSelect,
}: ThreadManagerProps) {
  // Show only 2 threads: parent (left) and current (right)
  // This creates a clear hierarchical view
  const visibleThreads = threads.slice(0, 2);
  const threadCount = visibleThreads.length;

  // Get child threads for each visible thread
  const getChildThreads = (threadId: string, allThreads: Thread[]): Thread[] => {
    return allThreads.filter((t) => t.parentThreadId === threadId);
  };

  // Determine if a thread is the current (rightmost) thread
  const isCurrentThread = (threadId: string) => {
    return threadId === threads[threads.length - 1]?.id;
  };

  return (
    <div className="flex h-full w-full">
      {visibleThreads.map((thread, index) => {
        const isCurrent = index === visibleThreads.length - 1;
        const isParent = index === 0 && visibleThreads.length > 1;

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
            />
          </div>
        );
      })}
    </div>
  );
}
