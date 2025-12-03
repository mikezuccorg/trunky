'use client';

import { Citation } from '@/types';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CitationsProps {
  citations: Citation[];
}

export function Citations({ citations }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden bg-surface">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center gap-2">
          <ExternalLink size={12} className="text-text-secondary" />
          Sources ({citations.length})
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-background">
          <div className="px-4 py-3 space-y-2">
            {citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded hover:bg-surface transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-text-secondary mt-0.5">
                    [{index + 1}]
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text-primary group-hover:text-blue-600 transition-colors">
                      {citation.title}
                    </div>
                    {citation.snippet && (
                      <div className="text-[11px] text-text-secondary mt-1 line-clamp-2">
                        {citation.snippet}
                      </div>
                    )}
                    <div className="text-[10px] text-text-secondary mt-1 truncate">
                      {citation.url}
                    </div>
                  </div>
                  <ExternalLink size={10} className="text-text-secondary flex-shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
