'use client';

import { useCallback } from 'react';
import { ConversationState, Thread } from '@/types';
import { createThread, storage } from '@/lib/storage';

interface UseThreadsOptions {
  conversationState: ConversationState;
  setConversationState: (state: ConversationState) => void;
}

export function useThreads({ conversationState, setConversationState }: UseThreadsOptions) {
  const createNewThread = useCallback(
    (parentThreadId: string, parentMessageId: string, selectedText: string): Thread => {
      const newThread = createThread(parentThreadId, parentMessageId, selectedText);

      const updatedState: ConversationState = {
        ...conversationState,
        threads: {
          ...conversationState.threads,
          [newThread.id]: newThread,
        },
        activeThreadIds: [parentThreadId, newThread.id], // Show parent and new thread
        currentThreadId: newThread.id, // Set new thread as current
      };

      setConversationState(updatedState);
      storage.saveConversations(updatedState);

      return newThread;
    },
    [conversationState, setConversationState]
  );

  const navigateToThread = useCallback(
    (threadId: string) => {
      const thread = conversationState.threads[threadId];
      if (!thread) return;

      // Show the thread and its parent (if it has one)
      const activeIds = thread.parentThreadId
        ? [thread.parentThreadId, threadId]
        : [threadId];

      const updatedState: ConversationState = {
        ...conversationState,
        activeThreadIds: activeIds,
        currentThreadId: threadId,
      };

      setConversationState(updatedState);
      storage.saveConversations(updatedState);
    },
    [conversationState, setConversationState]
  );

  const closeThread = useCallback(
    (threadId: string) => {
      // Navigate to parent thread when closing current thread
      const thread = conversationState.threads[threadId];
      if (thread?.parentThreadId) {
        navigateToThread(thread.parentThreadId);
      } else {
        // If no parent, go to main thread
        navigateToThread(conversationState.mainThreadId);
      }
    },
    [conversationState, navigateToThread]
  );

  const updateThread = useCallback(
    (thread: Thread) => {
      const updatedState: ConversationState = {
        ...conversationState,
        threads: {
          ...conversationState.threads,
          [thread.id]: thread,
        },
      };

      setConversationState(updatedState);
      storage.saveConversations(updatedState);
    },
    [conversationState, setConversationState]
  );

  // Get all threads as a tree structure
  const getAllThreads = useCallback(() => {
    return Object.values(conversationState.threads);
  }, [conversationState.threads]);

  // Get child threads for a given thread
  const getChildThreads = useCallback(
    (threadId: string) => {
      return Object.values(conversationState.threads).filter(
        (t) => t.parentThreadId === threadId
      );
    },
    [conversationState.threads]
  );

  return {
    createNewThread,
    closeThread,
    updateThread,
    navigateToThread,
    getAllThreads,
    getChildThreads,
    activeThreads: conversationState.activeThreadIds.map(
      (id) => conversationState.threads[id]
    ),
    currentThreadId: conversationState.currentThreadId,
  };
}
