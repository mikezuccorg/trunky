'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, ChevronDown, Brain } from 'lucide-react';
import { ChatSettings, CLAUDE_MODELS, ClaudeModel } from '@/types';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function InputArea({ onSend, disabled, placeholder = 'Type a message...', settings, onSettingsChange }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [showModelMenu, setShowModelMenu] = useState(false);
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

  const handleModelChange = (model: ClaudeModel) => {
    onSettingsChange({ ...settings, model });
    setShowModelMenu(false);
  };

  const handleThinkingToggle = () => {
    onSettingsChange({ ...settings, extendedThinking: !settings.extendedThinking });
  };

  const currentModelName = CLAUDE_MODELS[settings.model as ClaudeModel] || settings.model;
  const supportsThinking = settings.model.includes('claude-opus-4') ||
    settings.model.includes('claude-sonnet-4') ||
    settings.model.includes('claude-3-7');

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

        {/* Model Settings Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text-primary border border-border rounded hover:bg-surface-2 transition-colors"
              >
                {currentModelName}
                <ChevronDown size={10} className={`transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
              </button>

              {showModelMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowModelMenu(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
                    {Object.entries(CLAUDE_MODELS).map(([modelId, modelName]) => (
                      <button
                        key={modelId}
                        onClick={() => handleModelChange(modelId as ClaudeModel)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-surface transition-colors ${
                          settings.model === modelId ? 'bg-surface-2 font-medium' : ''
                        }`}
                      >
                        {modelName}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Extended Thinking Toggle */}
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
