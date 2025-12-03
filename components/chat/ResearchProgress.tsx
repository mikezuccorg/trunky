'use client';

import { Brain } from 'lucide-react';

interface ResearchProgressProps {
  progress: number;
  status?: string;
}

export function ResearchProgress({ progress, status }: ResearchProgressProps) {
  return (
    <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
            <Brain size={16} className="text-blue-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-900">
                Deep Research in progress...
              </span>
              <span className="text-xs text-blue-700">{progress}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status && (
              <p className="text-xs text-blue-700 mt-1">
                Status: {status}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
