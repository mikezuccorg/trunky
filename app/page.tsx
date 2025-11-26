'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { ChatApp } from '@/components/ChatApp';

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    const storedKey = storage.loadApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setHasApiKey(true);
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

  return <ChatApp apiKey={apiKey} onClearApiKey={handleClearApiKey} />;
}
