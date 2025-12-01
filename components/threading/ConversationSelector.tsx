'use client';

import { Thread } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { FolderOpen, MessageSquare } from 'lucide-react';

interface ConversationSelectorProps {
  threads: Thread[];
  mainThreadId: string;
  currentThreadId: string;
  onNavigate: (threadId: string) => void;
  onClose: () => void;
}

export function ConversationSelector({ threads, mainThreadId, currentThreadId, onNavigate, onClose }: ConversationSelectorProps) {
  // Find all root threads (threads with no parent)
  const rootThreads = threads.filter(t => t.parentThreadId === null);

  // Sort root threads by creation time, newest first
  const sortedRootThreads = [...rootThreads].sort((a, b) => b.createdAt - a.createdAt);

  // Helper to get all thread IDs in a conversation tree (both parents and children)
  const getAllThreadIdsInTree = (threadId: string): Set<string> => {
    const allIds = new Set<string>();

    // Helper to traverse up to root
    const traverseToRoot = (id: string) => {
      const thread = threads.find(t => t.id === id);
      if (!thread) return;
      allIds.add(id);
      if (thread.parentThreadId) {
        traverseToRoot(thread.parentThreadId);
      }
    };

    // Helper to traverse down to all children
    const traverseToChildren = (id: string) => {
      allIds.add(id);
      const children = threads.filter(t => t.parentThreadId === id);
      children.forEach(child => traverseToChildren(child.id));
    };

    // Start from the given thread ID
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return allIds;

    // First traverse up to find the root
    traverseToRoot(threadId);

    // Find the root thread from our collected IDs
    const rootId = Array.from(allIds).find(id => {
      const t = threads.find(th => th.id === id);
      return t && t.parentThreadId === null;
    });

    // Clear and rebuild from root down
    allIds.clear();
    if (rootId) {
      traverseToChildren(rootId);
    }

    return allIds;
  };

  // Get all thread IDs in the current active thread's conversation tree
  const currentConversationThreadIds = getAllThreadIdsInTree(currentThreadId);

  // Helper to count all threads in a conversation tree
  const getThreadCountInTree = (rootThreadId: string): number => {
    const countThreadsRecursively = (threadId: string): number => {
      const children = threads.filter(t => t.parentThreadId === threadId);
      return 1 + children.reduce((sum, child) => sum + countThreadsRecursively(child.id), 0);
    };
    return countThreadsRecursively(rootThreadId);
  };

  // Helper to get message count in a conversation tree
  const getMessageCountInTree = (rootThreadId: string): number => {
    const countMessagesRecursively = (threadId: string): number => {
      const thread = threads.find(t => t.id === threadId);
      const children = threads.filter(t => t.parentThreadId === threadId);
      const threadMessages = thread?.messages.length || 0;
      return threadMessages + children.reduce((sum, child) => sum + countMessagesRecursively(child.id), 0);
    };
    return countMessagesRecursively(rootThreadId);
  };

  return (
    <div className="fixed left-4 top-20 w-96 bg-white border border-border rounded-lg shadow-lg z-50 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Conversations</h3>
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
        {sortedRootThreads.map((rootThread, index) => {
          // Check if this conversation's tree contains the current active thread
          const isCurrentConversation = currentConversationThreadIds.has(rootThread.id);
          const threadCount = getThreadCountInTree(rootThread.id);
          const messageCount = getMessageCountInTree(rootThread.id);

          // Get first user message for title and preview
          const firstUserMessage = rootThread.messages.find(m => m.role === 'user');
          const conversationTitle = firstUserMessage?.content.slice(0, 80) || `Conversation ${sortedRootThreads.length - index}`;
          const preview = firstUserMessage?.content.slice(0, 150) || 'No messages yet';

          return (
            <button
              key={rootThread.id}
              onClick={() => {
                onNavigate(rootThread.id);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 mb-2 rounded-lg border transition-colors ${
                isCurrentConversation
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
                  : 'bg-white dark:bg-surface border-border hover:bg-surface-2'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 mt-0.5 ${isCurrentConversation ? 'text-orange-600 dark:text-orange-400' : 'text-text-secondary'}`}>
                  <FolderOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-sm font-semibold line-clamp-1 ${isCurrentConversation ? 'text-orange-900 dark:text-orange-300' : ''}`}>
                      {conversationTitle}
                    </div>
                    <div className={`text-[10px] flex-shrink-0 ml-2 ${isCurrentConversation ? 'text-orange-700 dark:text-orange-400' : 'text-text-secondary'}`}>
                      {formatTimestamp(rootThread.createdAt)}
                    </div>
                  </div>

                  <div className={`text-xs mb-2 line-clamp-2 ${isCurrentConversation ? 'text-orange-800 dark:text-orange-300' : 'text-text-secondary'}`}>
                    {preview}
                  </div>

                  <div className={`flex items-center gap-3 text-[10px] ${isCurrentConversation ? 'text-orange-700 dark:text-orange-400' : 'text-text-secondary'}`}>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={10} />
                      <span>{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0v-5H2a1 1 0 1 1 0-2h5V3a1 1 0 0 1 1-1z"/>
                      </svg>
                      <span>{threadCount} thread{threadCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-border bg-surface text-xs text-text-secondary">
        {rootThreads.length} total conversation{rootThreads.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
