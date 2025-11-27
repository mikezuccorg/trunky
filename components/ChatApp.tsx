'use client';

import { useState, useEffect } from 'react';
import { storage, createThread } from '@/lib/storage';
import { ConversationState } from '@/types';
import { ThreadManager } from '@/components/threading/ThreadManager';
import { ThreadSelector } from '@/components/chat/ThreadSelector';
import { ThreadTree } from '@/components/threading/ThreadTree';
import { ApiKeyModal } from '@/components/settings/ApiKeyModal';
import { useThreads } from '@/hooks/useThreads';
import { Network, Key } from 'lucide-react';

interface ChatAppProps {
  apiKey: string;
  onUpdateApiKey: (newKey: string) => void;
}

export function ChatApp({ apiKey, onUpdateApiKey }: ChatAppProps) {
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [pendingSelection, setPendingSelection] = useState<{
    text: string;
    messageId: string;
    threadId: string;
  } | null>(null);
  const [showThreadTree, setShowThreadTree] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Initialize conversation state
  useEffect(() => {
    const storedState = storage.loadConversations();
    if (storedState) {
      setConversationState(storedState);
    } else {
      // Create initial state with main thread
      const mainThread = createThread();
      const initialState: ConversationState = {
        threads: {
          [mainThread.id]: mainThread,
        },
        activeThreadIds: [mainThread.id],
        mainThreadId: mainThread.id,
        currentThreadId: mainThread.id,
        apiKey: null,
      };
      setConversationState(initialState);
      storage.saveConversations(initialState);
    }
  }, []);

  // Create a default empty state for initial render to satisfy hooks rules
  const defaultState: ConversationState = {
    threads: {},
    activeThreadIds: [],
    mainThreadId: '',
    currentThreadId: '',
    apiKey: null,
  };

  // Always call hooks unconditionally
  const threading = useThreads({
    conversationState: conversationState || defaultState,
    setConversationState,
  });

  const handleTextSelect = (text: string, messageId: string, threadId: string) => {
    setPendingSelection({ text, messageId, threadId });
  };

  const handleCreateThread = () => {
    if (pendingSelection && conversationState) {
      threading.createNewThread(
        pendingSelection.threadId,
        pendingSelection.messageId,
        pendingSelection.text
      );

      // Clear selection
      setPendingSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  if (!conversationState) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  const allThreads = threading.getAllThreads();

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Trunky</h1>
          <button
            onClick={() => setShowThreadTree(!showThreadTree)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-surface-2 transition-colors"
          >
            <Network size={14} />
            {allThreads.length} thread{allThreads.length !== 1 ? 's' : ''}
          </button>
        </div>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-surface-2 transition-colors"
        >
          <Key size={14} />
          API Key
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ThreadManager
          threads={threading.activeThreads}
          mainThreadId={conversationState.mainThreadId}
          apiKey={apiKey}
          onUpdateThread={threading.updateThread}
          onCloseThread={threading.closeThread}
          onTextSelect={handleTextSelect}
        />

        {pendingSelection && (
          <ThreadSelector onCreateThread={handleCreateThread} />
        )}

        {showThreadTree && (
          <ThreadTree
            threads={allThreads}
            mainThreadId={conversationState.mainThreadId}
            currentThreadId={threading.currentThreadId}
            onNavigate={threading.navigateToThread}
            onClose={() => setShowThreadTree(false)}
          />
        )}

        {showApiKeyModal && (
          <ApiKeyModal
            currentApiKey={apiKey}
            onSave={onUpdateApiKey}
            onClose={() => setShowApiKeyModal(false)}
          />
        )}
      </main>
    </div>
  );
}
