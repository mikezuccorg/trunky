'use client';

import { useState } from 'react';
import { ChevronDown, Zap, Brain as BrainIcon, Bot } from 'lucide-react';
import { AIProvider, CLAUDE_MODELS, PARALLEL_CHAT_MODELS, PARALLEL_RESEARCH_CONFIG } from '@/types';

interface ProviderSelectorProps {
  currentProvider: AIProvider;
  currentModel: string;
  onProviderChange: (provider: AIProvider, model: string) => void;
  hasAnthropicKey: boolean;
  hasParallelKey: boolean;
}

export function ProviderSelector({
  currentProvider,
  currentModel,
  onProviderChange,
  hasAnthropicKey,
  hasParallelKey,
}: ProviderSelectorProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'anthropic':
        return <Bot size={12} />;
      case 'parallel-chat':
        return <Zap size={12} />;
      case 'parallel-research':
        return <BrainIcon size={12} />;
    }
  };

  const getProviderLabel = () => {
    switch (currentProvider) {
      case 'anthropic':
        return 'Claude';
      case 'parallel-chat':
        return 'Parallel';
      case 'parallel-research':
        return 'Parallel Deep Research';
    }
  };

  const handleSelection = (provider: AIProvider, model: string) => {
    onProviderChange(provider, model);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text-primary border border-border rounded hover:bg-surface-2 transition-colors"
      >
        {getProviderIcon(currentProvider)}
        {getProviderLabel()}
        <ChevronDown size={10} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-border rounded-lg shadow-lg z-20 py-1 max-h-96 overflow-y-auto">

            {/* Anthropic Section */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2">
                <Bot size={12} />
                Anthropic Claude
                {!hasAnthropicKey && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                    No API Key
                  </span>
                )}
              </div>
              {Object.entries(CLAUDE_MODELS).map(([modelId, modelName]) => (
                <button
                  key={modelId}
                  onClick={() => handleSelection('anthropic', modelId)}
                  disabled={!hasAnthropicKey}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentProvider === 'anthropic' && currentModel === modelId
                      ? 'bg-surface-2 font-medium'
                      : ''
                  }`}
                >
                  {modelName}
                </button>
              ))}
            </div>

            <div className="border-t border-border my-1" />

            {/* Parallel Chat Section */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2">
                <Zap size={12} />
                Parallel
                {!hasParallelKey && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                    No API Key
                  </span>
                )}
              </div>
              {Object.entries(PARALLEL_CHAT_MODELS).map(([modelId, modelName]) => (
                <button
                  key={modelId}
                  onClick={() => handleSelection('parallel-chat', modelId)}
                  disabled={!hasParallelKey}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentProvider === 'parallel-chat' && currentModel === modelId
                      ? 'bg-surface-2 font-medium'
                      : ''
                  }`}
                >
                  {modelName}
                </button>
              ))}
            </div>

            <div className="border-t border-border my-1" />

            {/* Parallel Deep Research Section */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2">
                <BrainIcon size={12} />
                {PARALLEL_RESEARCH_CONFIG.name}
                {!hasParallelKey && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                    No API Key
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSelection('parallel-research', 'deep-research-default')}
                disabled={!hasParallelKey}
                className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentProvider === 'parallel-research'
                    ? 'bg-surface-2 font-medium'
                    : ''
                }`}
              >
                <div>{PARALLEL_RESEARCH_CONFIG.name}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">
                  {PARALLEL_RESEARCH_CONFIG.description}
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
