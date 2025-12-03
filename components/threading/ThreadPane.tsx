'use client';

import { Thread } from '@/types';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface ThreadPaneProps {
  thread: Thread;
  apiKey: string;
  parallelApiKey?: string;
  isMainThread: boolean;
  onUpdateThread: (thread: Thread) => void;
  onClose?: () => void;
  onTextSelect?: (text: string, messageId: string, threadId: string) => void;
  childThreads?: Thread[];
  allThreads?: Thread[];
  onNavigateToThread?: (threadId: string) => void;
}

export function ThreadPane({
  thread,
  apiKey,
  parallelApiKey,
  onUpdateThread,
  onClose,
  onTextSelect,
  childThreads = [],
  allThreads = [],
  onNavigateToThread,
}: ThreadPaneProps) {
  return (
    <div className="flex flex-col h-full border-r border-border last:border-r-0 animate-in slide-in-from-right duration-300">
      <ChatInterface
        thread={thread}
        apiKey={apiKey}
        parallelApiKey={parallelApiKey}
        onUpdateThread={onUpdateThread}
        onTextSelect={onTextSelect}
        childThreads={childThreads}
        onClose={onClose}
        allThreads={allThreads}
        onNavigateToThread={onNavigateToThread}
      />
    </div>
  );
}
