'use client';

import { useState } from 'react';
import { storage, FontSettings as FontSettingsType } from '@/lib/storage';

interface FontSettingsProps {
  currentSettings: FontSettingsType;
  onSettingsChange: (settings: FontSettingsType) => void;
}

export function FontSettings({ currentSettings, onSettingsChange }: FontSettingsProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleFontSizeChange = (fontSize: FontSettingsType['fontSize']) => {
    const newSettings = { ...currentSettings, fontSize };
    onSettingsChange(newSettings);
    storage.saveFontSettings(newSettings);
  };

  const handleFontFamilyChange = (fontFamily: FontSettingsType['fontFamily']) => {
    const newSettings = { ...currentSettings, fontFamily };
    onSettingsChange(newSettings);
    storage.saveFontSettings(newSettings);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-surface-2 transition-colors"
      >
        Font
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-lg z-20 py-2">
            {/* Font Size Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-text-secondary mb-2">
                Size
              </div>
              <div className="space-y-1">
                {(['small', 'medium', 'large', 'x-large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors ${
                      currentSettings.fontSize === size
                        ? 'bg-surface-2 font-medium'
                        : ''
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border my-2" />

            {/* Font Family Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-text-secondary mb-2">
                Font
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => handleFontFamilyChange('system')}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors ${
                    currentSettings.fontFamily === 'system'
                      ? 'bg-surface-2 font-medium'
                      : ''
                  }`}
                >
                  System
                </button>
                <button
                  onClick={() => handleFontFamilyChange('serif')}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors font-serif ${
                    currentSettings.fontFamily === 'serif'
                      ? 'bg-surface-2 font-medium'
                      : ''
                  }`}
                >
                  Serif
                </button>
                <button
                  onClick={() => handleFontFamilyChange('mono')}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-surface transition-colors font-mono ${
                    currentSettings.fontFamily === 'mono'
                      ? 'bg-surface-2 font-medium'
                      : ''
                  }`}
                >
                  Mono
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
