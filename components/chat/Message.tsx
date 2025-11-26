'use client';

import { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  onTextSelect?: (text: string, messageId: string) => void;
  isHighlighted?: boolean;
  highlightedText?: string;
}

export function Message({ message, onTextSelect, isHighlighted, highlightedText }: MessageProps) {
  const isUser = message.role === 'user';

  const handleMouseUp = () => {
    if (onTextSelect) {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && selectedText.length > 0) {
        onTextSelect(selectedText, message.id);
      }
    }
  };

  // Helper to render content with highlighted text
  const renderContent = () => {
    if (!isHighlighted || !highlightedText) {
      return message.content;
    }

    const index = message.content.indexOf(highlightedText);
    if (index === -1) {
      return message.content;
    }

    const before = message.content.slice(0, index);
    const highlighted = message.content.slice(index, index + highlightedText.length);
    const after = message.content.slice(index + highlightedText.length);

    return (
      <>
        {before}
        <span className="bg-highlight border-l-2 border-highlight-border px-1 py-0.5 rounded">
          {highlighted}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      className={`group px-6 py-6 transition-colors bg-background border-b border-border/30 ${
        isHighlighted ? 'ring-2 ring-highlight-border ring-inset' : ''
      }`}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-3xl">
        {!isUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-surface-3 text-text-primary">
              <Bot size={14} />
            </div>
            <span className="text-sm font-medium">Claude</span>
          </div>
        )}

        <div className={`text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser ? 'text-text-primary' : 'text-text-primary'
        }`}>
          {renderContent()}
        </div>

        {message.timestamp && (
          <div className="mt-2 text-xs text-text-secondary">
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
