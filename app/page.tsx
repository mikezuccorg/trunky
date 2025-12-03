'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { ChatApp } from '@/components/ChatApp';

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('');
  const [parallelApiKey, setParallelApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    const storedAnthropicKey = storage.loadApiKey();
    const storedParallelKey = storage.loadParallelApiKey();

    if (storedAnthropicKey) {
      setApiKey(storedAnthropicKey);
    }
    if (storedParallelKey) {
      setParallelApiKey(storedParallelKey);
    }

    // Require at least one key
    setHasApiKey(!!(storedAnthropicKey || storedParallelKey));
  }, []);

  const handleSaveApiKey = () => {
    // At least one key must be provided
    if (apiKey.trim() || parallelApiKey.trim()) {
      if (apiKey.trim()) {
        storage.saveApiKey(apiKey.trim());
      }
      if (parallelApiKey.trim()) {
        storage.saveParallelApiKey(parallelApiKey.trim());
      }
      setHasApiKey(true);
    }
  };

  const handleUpdateApiKey = (newAnthropicKey: string, newParallelKey: string) => {
    if (newAnthropicKey) {
      storage.saveApiKey(newAnthropicKey);
      setApiKey(newAnthropicKey);
    }
    if (newParallelKey) {
      storage.saveParallelApiKey(newParallelKey);
      setParallelApiKey(newParallelKey);
    }
    setHasApiKey(!!(newAnthropicKey || newParallelKey));
  };

  if (!hasApiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Trunky</h1>
            <p className="text-sm text-text-secondary">
              Threaded conversations with AI
            </p>
          </div>

          <div className="space-y-4">
            {/* Anthropic Key Input */}
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                Anthropic API Key (Optional)
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-surface"
              />
            </div>

            {/* Parallel Key Input */}
            <div className="space-y-2">
              <label htmlFor="parallelApiKey" className="text-sm font-medium">
                Parallel.ai API Key (Optional)
              </label>
              <input
                id="parallelApiKey"
                type="password"
                value={parallelApiKey}
                onChange={(e) => setParallelApiKey(e.target.value)}
                placeholder="para-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-surface"
              />
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() && !parallelApiKey.trim()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Continue
            </button>

            <p className="text-xs text-center text-text-secondary">
              Provide at least one API key. Keys are stored locally and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatApp
      apiKey={apiKey}
      parallelApiKey={parallelApiKey}
      onUpdateApiKey={handleUpdateApiKey}
    />
  );
}
