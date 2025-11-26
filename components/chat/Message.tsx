'use client';

import { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
  onTextSelect?: (text: string, messageId: string) => void;
}

export function Message({ message, onTextSelect }: MessageProps) {
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

  return (
    <div
      className={`group flex gap-4 px-6 py-6 ${
        isUser ? 'bg-user-message' : 'bg-assistant-message'
      }`}
      onMouseUp={handleMouseUp}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-accent text-white' : 'bg-surface-3 text-text-primary'
          }`}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'Claude'}
          </span>
          <span className="text-xs text-text-secondary">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
