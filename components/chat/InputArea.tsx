'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Brain } from 'lucide-react';
import { ChatSettings, AIProvider } from '@/types';
import { ProviderSelector } from './ProviderSelector';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  hasAnthropicKey: boolean;
  hasParallelKey: boolean;
}

export function InputArea({
  onSend,
  disabled,
  placeholder = 'Type a message...',
  settings,
  onSettingsChange,
  hasAnthropicKey,
  hasParallelKey,
}: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleProviderChange = (provider: AIProvider, model: string) => {
    onSettingsChange({
      ...settings,
      provider,
      model,
      // Disable extended thinking for non-Anthropic providers
      extendedThinking: provider === 'anthropic' ? settings.extendedThinking : false,
    });
  };

  const handleThinkingToggle = () => {
    onSettingsChange({ ...settings, extendedThinking: !settings.extendedThinking });
  };

  const supportsThinking = settings.provider === 'anthropic' && (
    settings.model.includes('claude-opus-4') ||
    settings.model.includes('claude-sonnet-4') ||
    settings.model.includes('claude-3-7')
  );

  return (
    <div className="border-t border-border bg-surface px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px] overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Settings Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Provider Selector */}
            <ProviderSelector
              currentProvider={settings.provider}
              currentModel={settings.model}
              onProviderChange={handleProviderChange}
              hasAnthropicKey={hasAnthropicKey}
              hasParallelKey={hasParallelKey}
            />

            {/* Extended Thinking Toggle - only show for Anthropic */}
            {supportsThinking && (
              <button
                onClick={handleThinkingToggle}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs border rounded transition-colors ${
                  settings.extendedThinking
                    ? 'bg-accent text-white border-accent hover:bg-opacity-90'
                    : 'text-text-secondary hover:text-text-primary border-border hover:bg-surface-2'
                }`}
                title="Extended thinking allows Claude to reason more deeply before responding"
              >
                <Brain size={10} />
                Thinking
              </button>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
