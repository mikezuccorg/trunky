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
  // Limit to maximum 4 visible threads for usability
  const visibleThreads = threads.slice(0, 4);
  const threadCount = visibleThreads.length;

  return (
    <div className="flex h-full w-full">
      {visibleThreads.map((thread) => (
        <div
          key={thread.id}
          className="flex-1"
          style={{
            minWidth: `${100 / Math.min(threadCount, 4)}%`,
            maxWidth: `${100 / Math.min(threadCount, 4)}%`,
          }}
        >
          <ThreadPane
            thread={thread}
            apiKey={apiKey}
            isMainThread={thread.id === mainThreadId}
            onUpdateThread={onUpdateThread}
            onClose={
              thread.id !== mainThreadId
                ? () => onCloseThread(thread.id)
                : undefined
            }
            onTextSelect={onTextSelect}
          />
        </div>
      ))}
    </div>
  );
}
