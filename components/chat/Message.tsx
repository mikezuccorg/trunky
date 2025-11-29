'use client';

import { useState, useMemo } from 'react';
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
  const isInherited = message.isInherited || false;
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

  // Memoize markdown components to prevent re-creation on every render
  const markdownComponents = useMemo(() => ({
    p: ({ children }: any) => <p className="mb-4 last:mb-0">{children}</p>,
    h1: ({ children }: any) => <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="ml-4">{children}</li>,
    code: ({ inline, className, children, ...props }: any) => {
      // Extract language from className (format: language-xxx)
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (inline) {
        return (
          <code className="bg-surface-2 px-1.5 py-0.5 rounded text-sm font-mono text-accent" {...props}>
            {children}
          </code>
        );
      }

      return (
        <div className="my-4 rounded-lg overflow-hidden border border-border bg-surface">
          {language && (
            <div className="px-4 py-2 bg-surface-2 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary uppercase">{language}</span>
            </div>
          )}
          <pre className="overflow-x-auto">
            <code className="block px-4 py-3 text-sm font-mono leading-relaxed text-text-primary" {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    pre: ({ children }: any) => <>{children}</>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-border pl-4 italic my-4 text-text-secondary">
        {children}
      </blockquote>
    ),
    a: ({ children, href }: any) => (
      <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  }), []);

  // Helper function to highlight text within string content
  const highlightText = (text: string): React.ReactNode => {
    if (!highlightedText || !text.includes(highlightedText)) {
      return text;
    }
    const parts = text.split(highlightedText);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <mark className="bg-highlight border-l-2 border-highlight-border px-1 py-0.5 rounded">
            {highlightedText}
          </mark>
        )}
      </span>
    ));
  };

  // Create highlighted versions of components when needed
  const getComponents = useMemo(() => {
    if (!isUser && isHighlighted && highlightedText) {
      // Create wrapper that processes children to add highlights
      const wrapWithHighlight = (Component: any, className?: string) => {
        return ({ children, ...props }: any) => {
          const processChildren = (child: any): any => {
            if (typeof child === 'string') {
              return highlightText(child);
            }
            if (Array.isArray(child)) {
              return child.map(processChildren);
            }
            return child;
          };

          return <Component className={className} {...props}>{processChildren(children)}</Component>;
        };
      };

      return {
        p: wrapWithHighlight('p', 'mb-4 last:mb-0'),
        h1: wrapWithHighlight('h1', 'text-2xl font-semibold mb-4 mt-6 first:mt-0'),
        h2: wrapWithHighlight('h2', 'text-xl font-semibold mb-3 mt-5 first:mt-0'),
        h3: wrapWithHighlight('h3', 'text-lg font-semibold mb-2 mt-4 first:mt-0'),
        ul: wrapWithHighlight('ul', 'list-disc list-inside mb-4 space-y-1'),
        ol: wrapWithHighlight('ol', 'list-decimal list-inside mb-4 space-y-1'),
        li: wrapWithHighlight('li', 'ml-4'),
        blockquote: wrapWithHighlight('blockquote', 'border-l-4 border-border pl-4 italic my-4 text-text-secondary'),
        strong: wrapWithHighlight('strong', 'font-semibold'),
        em: wrapWithHighlight('em', 'italic'),
        // Code blocks and inline code don't need highlighting
        code: markdownComponents.code,
        pre: markdownComponents.pre,
        a: markdownComponents.a,
      };
    }
    return markdownComponents;
  }, [isUser, isHighlighted, highlightedText, markdownComponents]);

  // Helper to render content with highlighted text
  const renderContent = useMemo(() => {
    const content = message.content;

    // For bot messages, render markdown
    if (!isUser) {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={getComponents}
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
  }, [message.content, isUser, isHighlighted, highlightedText, getComponents]);

  return (
    <div
      className={`group px-6 py-6 transition-colors ${
        isInherited ? 'bg-surface/50 opacity-70' : 'bg-background'
      } border-b border-border/30 ${
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
            {isInherited && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-border">
                From parent thread
              </span>
            )}
          </div>
        )}
        {isUser && isInherited && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-border">
              From parent thread
            </span>
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
          {renderContent}
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
