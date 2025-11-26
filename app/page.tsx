'use client';

import { useEffect, useState } from 'react';
import { storage, createThread } from '@/lib/storage';
import { ConversationState } from '@/types';
import { ThreadManager } from '@/components/threading/ThreadManager';
import { ThreadSelector } from '@/components/chat/ThreadSelector';
import { useThreads } from '@/hooks/useThreads';

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [pendingSelection, setPendingSelection] = useState<{
    text: string;
    messageId: string;
    threadId: string;
  } | null>(null);

  // Initialize conversation state
  useEffect(() => {
    const storedKey = storage.loadApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setHasApiKey(true);
    }

    // Load or create conversation state
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
        apiKey: null,
      };
      setConversationState(initialState);
      storage.saveConversations(initialState);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      storage.saveApiKey(apiKey.trim());
      setHasApiKey(true);
    }
  };

  const handleClearApiKey = () => {
    storage.clearApiKey();
    setApiKey('');
    setHasApiKey(false);
  };

  // Create a default empty state for initial render to satisfy hooks rules
  const defaultState: ConversationState = {
    threads: {},
    activeThreadIds: [],
    mainThreadId: '',
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

  if (!hasApiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Trunky</h1>
            <p className="text-sm text-text-secondary">
              Threaded conversations with Claude AI
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Anthropic API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-surface"
              />
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Continue
            </button>

            <p className="text-xs text-center text-text-secondary">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!conversationState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Trunky</h1>
          <span className="text-xs text-text-secondary">
            {threading.activeThreads.length} thread{threading.activeThreads.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleClearApiKey}
          className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-surface-2 transition-colors"
        >
          Change API Key
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
      </main>
    </div>
  );
}
