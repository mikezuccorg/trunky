'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
  currentApiKey?: string;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

export function ApiKeyModal({ currentApiKey, onSave, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">API Key Settings</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium block">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-text-primary">Security Notice</p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Your API key is stored locally in your browser</li>
              <li>• It is never sent to our servers</li>
              <li>• Only transmitted directly to Anthropic&apos;s API</li>
            </ul>
          </div>

          {currentApiKey && (
            <p className="text-xs text-text-secondary">
              Current key: {currentApiKey.slice(0, 15)}...{currentApiKey.slice(-4)}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Save API Key
          </button>
        </div>
      </div>
    </div>
  );
}
