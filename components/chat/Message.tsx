'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/lib/utils';
import { Bot, Brain, ChevronDown, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Citations } from './Citations';

interface ThreadSelection {
  threadId: string;
  selectedText: string;
  messageCount: number;
}

interface MessageProps {
  message: MessageType;
  onTextSelect?: (text: string, messageId: string) => void;
  isHighlighted?: boolean;
  highlightedText?: string;
  childThreads?: ThreadSelection[]; // Threads that branch from this message
  onNavigateToThread?: (threadId: string) => void;
}

export function Message({ message, onTextSelect, isHighlighted, highlightedText, childThreads = [], onNavigateToThread }: MessageProps) {
  const isUser = message.role === 'user';
  const isInherited = message.isInherited || false;
  const [showThinking, setShowThinking] = useState(false);

  const getProviderIcon = () => {
    if (!message.provider) return <Bot size={14} />;

    switch (message.provider) {
      case 'anthropic':
        return <Bot size={14} />;
      case 'parallel-chat':
        return <Zap size={14} />;
      case 'parallel-research':
        return <Brain size={14} />;
    }
  };

  const getProviderLabel = () => {
    if (!message.provider) return 'Claude';

    switch (message.provider) {
      case 'anthropic':
        return 'Claude';
      case 'parallel-chat':
        return 'Parallel';
      case 'parallel-research':
        return 'Deep Research';
    }
  };

  const handleMouseUp = () => {
    if (onTextSelect) {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (selectedText && selectedText.length > 0) {
        onTextSelect(selectedText, message.id);
      }
    }
  };

  // Helper to process citation references in text
  const processCitationReferences = useCallback((text: string): React.ReactNode => {
    const citations = message.metadata?.citations || [];
    if (citations.length === 0) return text;

    // Match citation references like [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      const fullMatch = match[0]; // e.g., "[2]"
      const citationNumber = parseInt(match[1], 10);
      const citationIndex = citationNumber - 1;
      const citation = citations[citationIndex];

      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add citation link
      if (citation) {
        parts.push(
          <a
            key={`citation-${match.index}`}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-mono text-sm"
            title={citation.title}
          >
            {fullMatch}
          </a>
        );
      } else {
        // If citation doesn't exist (still streaming), show as plain text
        parts.push(fullMatch);
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  }, [message.metadata?.citations]);

  // Memoize markdown components to prevent re-creation on every render
  const markdownComponents = useMemo<Components>(() => ({
    p: ({ children }) => {
      // Process citation references in paragraph text
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return processCitationReferences(child);
        }
        return child;
      });
      return <p className="mb-4 last:mb-0">{processedChildren}</p>;
    },
    h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => {
      // Process citation references in list items
      const processedChildren = React.Children.map(children, child => {
        if (typeof child === 'string') {
          return processCitationReferences(child);
        }
        return child;
      });
      return <li className="ml-4">{processedChildren}</li>;
    },
    code: ({ className, children, ...props }) => {
      // Extract language from className (format: language-xxx)
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const inline = !language; // If no language, it's inline code

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
          <pre className="overflow-x-auto whitespace-pre">
            <code className="block px-4 py-3 text-sm font-mono leading-relaxed text-text-primary whitespace-pre" {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    pre: ({ children }) => {
      // Handle standalone pre tags (text-based graphics not in code blocks)
      return (
        <pre className="my-4 overflow-x-auto whitespace-pre font-mono text-sm leading-tight text-text-primary bg-surface px-4 py-3 rounded-lg border border-border">
          {children}
        </pre>
      );
    },
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
  }), [processCitationReferences]);

  // Helper function to highlight text with both active highlights and thread selections
  const highlightText = useCallback((text: string): React.ReactNode => {
    // First, process citation references
    const textWithCitations = processCitationReferences(text);

    // If citation processing returned React nodes, we need to handle it differently
    // For now, we'll only apply highlights to plain text
    if (React.isValidElement(textWithCitations) || Array.isArray(textWithCitations)) {
      // Text contains citations, skip highlighting to avoid conflicts
      return textWithCitations;
    }

    // Build a list of all text ranges that need special rendering
    const highlights: Array<{
      start: number;
      end: number;
      type: 'active' | 'thread';
      threadId?: string;
      messageCount?: number;
    }> = [];

    // Add thread selections (grey) - do this first so active highlight can override
    childThreads.forEach((thread) => {
      if (thread.selectedText) {
        let searchIndex = 0;
        let index = text.indexOf(thread.selectedText, searchIndex);

        // Find all occurrences of this selected text
        while (index !== -1) {
          highlights.push({
            start: index,
            end: index + thread.selectedText.length,
            type: 'thread',
            threadId: thread.threadId,
            messageCount: thread.messageCount,
          });
          searchIndex = index + 1;
          index = text.indexOf(thread.selectedText, searchIndex);
        }
      }
    });

    // Add active highlight (yellow) - this takes priority
    if (isHighlighted && highlightedText) {
      const index = text.indexOf(highlightedText);
      if (index !== -1) {
        // Remove any overlapping thread highlights
        const activeStart = index;
        const activeEnd = index + highlightedText.length;

        // Filter out overlapping thread highlights
        const nonOverlapping = highlights.filter(h => {
          return h.end <= activeStart || h.start >= activeEnd;
        });

        highlights.length = 0;
        highlights.push(...nonOverlapping);

        highlights.push({
          start: index,
          end: index + highlightedText.length,
          type: 'active',
        });
      }
    }

    // If no highlights, return plain text
    if (highlights.length === 0) {
      return text;
    }

    // Sort highlights by start position
    highlights.sort((a, b) => a.start - b.start);

    // Render text with highlights
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, i) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(text.slice(lastIndex, highlight.start));
      }

      // Add highlighted text
      const highlightedTextContent = text.slice(highlight.start, highlight.end);

      if (highlight.type === 'active') {
        parts.push(
          <span
            key={`highlight-${i}`}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-600 dark:border-yellow-500 px-1 py-0.5 rounded inline-flex items-center gap-1 group"
          >
            <span>{highlightedTextContent}</span>
            <span className="inline-flex items-center justify-center px-1.5 h-4 text-[9px] font-bold bg-yellow-600 dark:bg-yellow-500 text-white rounded uppercase tracking-wide">
              ACTIVE
            </span>
          </span>
        );
      } else if (highlight.type === 'thread') {
        parts.push(
          <span
            key={`thread-${i}`}
            onClick={() => onNavigateToThread?.(highlight.threadId!)}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-1 py-0.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1 group"
          >
            <span>{highlightedTextContent}</span>
            <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded">
              {highlight.messageCount}
            </span>
          </span>
        );
      }

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  }, [isHighlighted, highlightedText, childThreads, onNavigateToThread, processCitationReferences]);

  // Create highlighted versions of components when needed
  const getComponents = useMemo(() => {
    // Apply highlighting for bot messages if there are active highlights or thread selections
    const shouldApplyHighlighting = !isUser && ((isHighlighted && highlightedText) || childThreads.length > 0);

    if (shouldApplyHighlighting) {
      // Create wrapper that processes children to add highlights
      const wrapWithHighlight = (Component: string, className?: string) => {
        const WrappedComponent = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const processChildren = (child: React.ReactNode): React.ReactNode => {
            if (typeof child === 'string') {
              return highlightText(child);
            }
            if (Array.isArray(child)) {
              return child.map(processChildren);
            }
            return child;
          };

          return React.createElement(Component, { className, ...props }, processChildren(children));
        };
        WrappedComponent.displayName = `Highlighted${Component}`;
        return WrappedComponent;
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
      } as Components;
    }
    return markdownComponents;
  }, [isUser, isHighlighted, highlightedText, childThreads, markdownComponents, highlightText]);

  // Helper to render user message content with thread selections and highlights
  const renderUserContent = useMemo(() => {
    const content = message.content;
    // Use the same highlightText function for consistency
    return highlightText(content);
  }, [message.content, highlightText]);

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

    // For user messages, use the new render function with thread selections
    return renderUserContent;
  }, [message.content, isUser, getComponents, renderUserContent]);

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
              {getProviderIcon()}
            </div>
            <span className="text-sm font-medium">{getProviderLabel()}</span>
            {message.provider && message.provider !== 'anthropic' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                {getProviderLabel()}
              </span>
            )}
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

        {/* Citations Display */}
        {!isUser && message.metadata?.citations && message.metadata.citations.length > 0 && (
          <Citations citations={message.metadata.citations} />
        )}

        {message.timestamp && (
          <div className="mt-2 text-xs text-text-secondary">
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}
