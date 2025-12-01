'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Message, Thread } from '@/types';

interface ThreadMinimapProps {
  messages: Message[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  allThreads?: Thread[];
  highlightMessageId?: string;
  highlightedText?: string;
  messageHeights: Map<string, number>;
}

interface MessageLayout {
  messageId: string;
  startY: number;
  height: number;
  lines: { text: string; width: number }[];
  hasCode: boolean;
  threadSelections: { text: string; startLine: number; endLine: number }[];
}

export function ThreadMinimap({
  messages,
  containerRef,
  allThreads = [],
  highlightMessageId,
  highlightedText,
  messageHeights
}: ThreadMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewportPosition, setViewportPosition] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate message layouts based on actual DOM heights
  const calculateMessageLayouts = useCallback((msgs: Message[], canvasHeight: number): MessageLayout[] => {
    const CHARS_PER_LINE = 50;

    // Calculate total actual height
    let totalHeight = 0;
    const actualHeights = msgs.map(msg => {
      const height = messageHeights.get(msg.id) || 100; // fallback height
      totalHeight += height;
      return height;
    });

    // Scale to fit canvas
    const scale = canvasHeight / totalHeight;
    let currentY = 0;

    return msgs.map((message, index) => {
      const actualHeight = actualHeights[index];
      const scaledHeight = actualHeight * scale;

      // Calculate lines for visual representation
      const lines = message.content.split('\n').flatMap((line) => {
        if (line.length === 0) return [{ text: '', width: 0 }];

        const wrappedLines: { text: string; width: number }[] = [];
        for (let i = 0; i < line.length; i += CHARS_PER_LINE) {
          const segment = line.substring(i, i + CHARS_PER_LINE);
          wrappedLines.push({
            text: segment,
            width: Math.min(segment.length / CHARS_PER_LINE, 1)
          });
        }
        return wrappedLines;
      });

      const layout: MessageLayout = {
        messageId: message.id,
        startY: currentY,
        height: scaledHeight,
        lines,
        hasCode: message.content.includes('```'),
        threadSelections: []
      };

      // Find thread selections for this message
      const childThreads = allThreads.filter(t => t.parentMessageId === message.id && t.selectedText);
      childThreads.forEach((thread) => {
        if (!thread.selectedText) return;

        const selectionIndex = message.content.indexOf(thread.selectedText);
        if (selectionIndex === -1) return;

        // Calculate which lines the selection spans
        let charCount = 0;
        let startLine = -1;
        let endLine = -1;

        for (let i = 0; i < lines.length; i++) {
          const lineStart = charCount;
          const lineEnd = charCount + lines[i].text.length;

          if (startLine === -1 && selectionIndex >= lineStart && selectionIndex < lineEnd) {
            startLine = i;
          }
          if (selectionIndex + thread.selectedText.length > lineStart && selectionIndex + thread.selectedText.length <= lineEnd) {
            endLine = i;
            break;
          }

          charCount += lines[i].text.length;
        }

        if (startLine !== -1 && endLine !== -1) {
          layout.threadSelections.push({
            text: thread.selectedText,
            startLine,
            endLine
          });
        }
      });

      currentY += scaledHeight;
      return layout;
    });
  }, [messageHeights, allThreads]);

  // Update viewport indicator when scroll happens
  useEffect(() => {
    const container = containerRef.current;
    const minimap = minimapRef.current;
    if (!container || !minimap) return;

    const handleScroll = () => {
      const scrollableHeight = container.scrollHeight - container.clientHeight;
      const minimapHeight = minimap.clientHeight;

      if (scrollableHeight <= 0) {
        setViewportPosition(0);
        setViewportHeight(minimapHeight);
        return;
      }

      const scrollPercentage = container.scrollTop / scrollableHeight;
      const viewportHeightPercentage = container.clientHeight / container.scrollHeight;

      // Clamp viewport position to ensure it doesn't go beyond bounds
      const calculatedPosition = scrollPercentage * minimapHeight;
      const calculatedHeight = viewportHeightPercentage * minimapHeight;

      // Ensure viewport box stays within minimap bounds
      const maxPosition = minimapHeight - calculatedHeight;
      const clampedPosition = Math.min(Math.max(0, calculatedPosition), maxPosition);

      setViewportPosition(clampedPosition);
      setViewportHeight(calculatedHeight);
    };

    handleScroll(); // Initial call
    container.addEventListener('scroll', handleScroll);

    // Also update on resize
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, messageHeights]);

  // Render minimap visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || messageHeights.size === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const width = 80;
    const height = canvas.parentElement?.clientHeight || 400;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Get dark mode state
    const isDark = document.documentElement.classList.contains('dark');

    // Clear canvas with background
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)';
    ctx.fillRect(0, 0, width, height);

    // Calculate message layouts
    const layouts = calculateMessageLayouts(messages, height);
    const padding = 6;

    messages.forEach((message, index) => {
      const layout = layouts[index];
      const isUser = message.role === 'user';
      const isHighlighted = message.id === highlightMessageId;

      // Draw message background
      if (isUser) {
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.2)';
      } else {
        ctx.fillStyle = isDark ? 'rgba(134, 239, 172, 0.2)' : 'rgba(74, 222, 128, 0.15)';
      }
      ctx.fillRect(padding, layout.startY, width - padding * 2, layout.height);

      // Draw accurate line representations
      const scaledLineHeight = Math.max((layout.height - 4) / layout.lines.length, 1);
      ctx.fillStyle = isDark
        ? (isUser ? 'rgba(59, 130, 246, 0.5)' : 'rgba(74, 222, 128, 0.4)')
        : (isUser ? 'rgba(37, 99, 235, 0.4)' : 'rgba(34, 197, 94, 0.3)');

      layout.lines.forEach((line, lineIndex) => {
        if (line.text.trim().length === 0) return;

        const lineY = layout.startY + 2 + (lineIndex * scaledLineHeight);
        const lineWidth = (width - padding * 3) * line.width;

        ctx.fillRect(padding + 4, lineY, lineWidth, Math.max(scaledLineHeight * 0.6, 1));
      });

      // Draw thread selection highlights
      layout.threadSelections.forEach((selection) => {
        ctx.fillStyle = isDark ? 'rgba(156, 163, 175, 0.4)' : 'rgba(107, 114, 128, 0.3)';

        const selectionStartY = layout.startY + 2 + (selection.startLine * scaledLineHeight);
        const selectionHeight = ((selection.endLine - selection.startLine + 1) * scaledLineHeight);

        ctx.fillRect(padding + 2, selectionStartY, width - padding * 2 - 4, selectionHeight);

        ctx.fillStyle = isDark ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.6)';
        ctx.fillRect(padding, selectionStartY, 2, selectionHeight);
      });

      // Draw active highlight
      if (isHighlighted && highlightedText) {
        const selectionIndex = message.content.indexOf(highlightedText);
        if (selectionIndex !== -1) {
          let charCount = 0;
          let startLine = -1;
          let endLine = -1;

          for (let i = 0; i < layout.lines.length; i++) {
            const lineStart = charCount;
            const lineEnd = charCount + layout.lines[i].text.length;

            if (startLine === -1 && selectionIndex >= lineStart && selectionIndex < lineEnd) {
              startLine = i;
            }
            if (selectionIndex + highlightedText.length > lineStart && selectionIndex + highlightedText.length <= lineEnd) {
              endLine = i;
              break;
            }

            charCount += layout.lines[i].text.length;
          }

          if (startLine !== -1 && endLine !== -1) {
            ctx.fillStyle = isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(252, 211, 77, 0.5)';

            const selectionStartY = layout.startY + 2 + (startLine * scaledLineHeight);
            const selectionHeight = ((endLine - startLine + 1) * scaledLineHeight);

            ctx.fillRect(padding + 2, selectionStartY, width - padding * 2 - 4, selectionHeight);

            ctx.fillStyle = isDark ? 'rgba(251, 191, 36, 0.9)' : 'rgba(245, 158, 11, 0.8)';
            ctx.fillRect(padding, selectionStartY, 2, selectionHeight);
          }
        }
      }

      // Highlight code blocks with accent stripe
      if (layout.hasCode) {
        ctx.fillStyle = isDark ? 'rgba(168, 85, 247, 0.5)' : 'rgba(147, 51, 234, 0.4)';
        ctx.fillRect(width - 6, layout.startY, 3, Math.min(layout.height * 0.4, layout.height - 4));
      }

      // Add separator between messages
      if (index < messages.length - 1) {
        ctx.fillStyle = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)';
        ctx.fillRect(padding, layout.startY + layout.height - 1, width - padding * 2, 1);
      }
    });

    // Draw viewport indicator - VS Code style
    ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(0, viewportPosition, width, viewportHeight);

    ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, viewportPosition + 0.75, width - 1.5, viewportHeight - 1.5);

  }, [messages, viewportPosition, viewportHeight, allThreads, highlightMessageId, highlightedText, messageHeights, calculateMessageLayouts]);

  // Handle scroll from minimap interaction
  const scrollToPosition = (clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const clickY = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const percentage = clickY / rect.height;

    container.scrollTop = percentage * (container.scrollHeight - container.clientHeight);
  };

  // Handle mouse events for click and drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    scrollToPosition(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      scrollToPosition(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      ref={minimapRef}
      className="absolute right-0 top-0 bottom-0 w-20 border-l border-border/50 bg-gradient-to-l from-surface/80 to-surface/40 backdrop-blur-sm z-10 hover:from-surface/90 hover:to-surface/60 transition-all duration-200"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'} hover:opacity-90 transition-opacity`}
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}
