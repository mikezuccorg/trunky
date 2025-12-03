'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
  currentApiKey?: string;
  currentParallelApiKey?: string;
  onSave: (anthropicKey: string, parallelKey: string) => void;
  onClose: () => void;
}

export function ApiKeyModal({ currentApiKey, currentParallelApiKey, onSave, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [parallelApiKey, setParallelApiKey] = useState(currentParallelApiKey || '');
  const [showKeys, setShowKeys] = useState({ anthropic: false, parallel: false });

  const handleSave = () => {
    // At least one key must be provided
    if (apiKey.trim() || parallelApiKey.trim()) {
      onSave(apiKey.trim(), parallelApiKey.trim());
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
        <div className="px-6 py-6 space-y-6">
          {/* Anthropic API Key */}
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium block">
              Anthropic API Key (Claude)
            </label>
            <div className="relative">
              <input
                id="apiKey"
                type={showKeys.anthropic ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                {showKeys.anthropic ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Parallel API Key */}
          <div className="space-y-2">
            <label htmlFor="parallelApiKey" className="text-sm font-medium block">
              Parallel.ai API Key
            </label>
            <div className="relative">
              <input
                id="parallelApiKey"
                type={showKeys.parallel ? 'text' : 'password'}
                value={parallelApiKey}
                onChange={(e) => setParallelApiKey(e.target.value)}
                placeholder="para-..."
                className="w-full px-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKeys(prev => ({ ...prev, parallel: !prev.parallel }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
              >
                {showKeys.parallel ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Required for Parallel Chat and Deep Research features
            </p>
          </div>

          {/* Security Notice */}
          <div className="bg-surface rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-text-primary">Security Notice</p>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Your API keys are stored locally in your browser</li>
              <li>• They are never sent to our servers</li>
              <li>• Only transmitted directly to the respective AI provider APIs</li>
            </ul>
          </div>
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
            disabled={!apiKey.trim() && !parallelApiKey.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Save API Keys
          </button>
        </div>
      </div>
    </div>
  );
}
