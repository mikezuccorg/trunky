'use client';

import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';

interface ThreadSelectorProps {
  onCreateThread: () => void;
  selectedText: string;
}

export function ThreadSelector({ onCreateThread, selectedText }: ThreadSelectorProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && text === selectedText) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
        }
      } else if (!text || text.length === 0) {
        setPosition(null);
      }
    };

    handleSelectionChange(); // Call immediately to position button
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [selectedText]);

  if (!position || !selectedText) {
    return null;
  }

  return (
    <div
      className="fixed z-50 -translate-x-1/2 -translate-y-full animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={onCreateThread}
        className="flex items-center gap-2 px-3 py-2 bg-accent text-white text-sm rounded-lg shadow-lg hover:bg-opacity-90 transition-all whitespace-nowrap hover:scale-105"
      >
        <GitBranch size={16} />
        Create Thread
      </button>
    </div>
  );
}
