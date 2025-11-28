'use client';

import { useState } from 'react';
import { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { Bot, Brain, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: MessageType;
  onTextSelect?: (text: string, messageId: string) => void;
  isHighlighted?: boolean;
  highlightedText?: string;
}

export function Message({ message, onTextSelect, isHighlighted, highlightedText }: MessageProps) {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);

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
    const content = message.content;

    // For bot messages, render markdown
    if (!isUser) {
      if (isHighlighted && highlightedText) {
        const index = content.indexOf(highlightedText);
        if (index !== -1) {
          const before = content.slice(0, index);
          const highlighted = content.slice(index, index + highlightedText.length);
          const after = content.slice(index + highlightedText.length);

          return (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-4">{children}</li>,
                code: ({ inline, children, ...props }: any) =>
                  inline ? (
                    <code className="bg-surface-2 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-surface-2 p-3 rounded text-sm font-mono overflow-x-auto mb-4" {...props}>
                      {children}
                    </code>
                  ),
                pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-border pl-4 italic my-4 text-text-secondary">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {before}
              <span className="bg-highlight border-l-2 border-highlight-border px-1 py-0.5 rounded">
                {highlighted}
              </span>
              {after}
            </ReactMarkdown>
          );
        }
      }

      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="ml-4">{children}</li>,
            code: ({ inline, children, ...props }: any) =>
              inline ? (
                <code className="bg-surface-2 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              ) : (
                <code className="block bg-surface-2 p-3 rounded text-sm font-mono overflow-x-auto mb-4" {...props}>
                  {children}
                </code>
              ),
            pre: ({ children }) => <pre className="mb-4">{children}</pre>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-border pl-4 italic my-4 text-text-secondary">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }

    // For user messages, handle highlighting
    if (isHighlighted && highlightedText) {
      const index = content.indexOf(highlightedText);
      if (index !== -1) {
        const before = content.slice(0, index);
        const highlighted = content.slice(index, index + highlightedText.length);
        const after = content.slice(index + highlightedText.length);

        return (
          <>
            {before}
            <span className="bg-highlight border-l-2 border-highlight-border px-1 py-0.5 rounded">
              {highlighted}
            </span>
            {after}
          </>
        );
      }
    }

    return content;
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

        {/* Extended Thinking Block */}
        {!isUser && message.thinking && (
          <div className="mb-4 border border-border rounded-lg overflow-hidden bg-surface">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain size={12} className="text-text-secondary" />
                <span>Extended Thinking</span>
              </div>
              <ChevronDown
                size={12}
                className={`transition-transform ${showThinking ? 'rotate-180' : ''}`}
              />
            </button>
            {showThinking && (
              <div className="px-4 py-3 text-xs text-text-secondary border-t border-border bg-background whitespace-pre-wrap">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        <div className={`text-[15px] leading-relaxed break-words ${
          isUser ? 'text-text-primary whitespace-pre-wrap' : 'text-text-primary markdown-content'
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
