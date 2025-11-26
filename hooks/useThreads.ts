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
        activeThreadIds: [...conversationState.activeThreadIds, newThread.id],
      };

      setConversationState(updatedState);
      storage.saveConversations(updatedState);

      return newThread;
    },
    [conversationState, setConversationState]
  );

  const closeThread = useCallback(
    (threadId: string) => {
      if (threadId === conversationState.mainThreadId) {
        // Can't close the main thread
        return;
      }

      const updatedState: ConversationState = {
        ...conversationState,
        activeThreadIds: conversationState.activeThreadIds.filter((id) => id !== threadId),
      };

      setConversationState(updatedState);
      storage.saveConversations(updatedState);
    },
    [conversationState, setConversationState]
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

  return {
    createNewThread,
    closeThread,
    updateThread,
    activeThreads: conversationState.activeThreadIds.map(
      (id) => conversationState.threads[id]
    ),
  };
}
