import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES, ThemeId } from '../../contexts/ThemeContext';
import { Palette, Check, Moon, Sun, Sparkles } from 'lucide-react';

// ============================================================
// COMPACT TOP-NAV THEME DROPDOWN
// ============================================================
export function TopNavThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = THEMES[theme];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] text-xs font-semibold transition-all shadow-2xs"
        title="Switch color theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
          style={{ backgroundColor: current.colors.primary }}
        />
        <span className="hidden md:inline text-[11px] truncate max-w-[85px]">{current.name}</span>
        <Palette className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-2 z-50 fade-in">
          <div className="px-2.5 py-2 border-b border-[var(--border-color)] mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Select Color Theme
            </span>
            <Palette className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const item = THEMES[id];
              const isSelected = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-[var(--bg-highlight)] text-[var(--primary)] font-bold'
                      : 'hover:bg-[var(--bg-muted)] text-[var(--text-main)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch Pill */}
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs z-10"
                        style={{ backgroundColor: item.colors.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: item.colors.background }}
                      />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[var(--primary)] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FULL SETTINGS PAGE THEME SELECTOR GRID
// ============================================================
export function SettingsThemeGrid() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(Object.keys(THEMES) as ThemeId[]).map((id) => {
        const item = THEMES[id];
        const isSelected = theme === id;

        return (
          <div
            key={id}
            onClick={() => setTheme(id)}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30 bg-[var(--bg-highlight)] shadow-md'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-muted)] hover:shadow-sm'
            }`}
          >
            {/* Active Checkmark Pill */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-text)] flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            {/* Theme Header */}
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex-shrink-0"
                style={{ backgroundColor: item.colors.primary }}
              />
              <div className="min-w-0 pr-6">
                <h4 className="text-sm font-bold text-[var(--text-main)] truncate">{item.name}</h4>
                <p className="text-[11px] text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>

            {/* Visual Color Preview Palette Bar */}
            <div className="mt-3.5 p-2 rounded-lg border border-[var(--border-color)] bg-slate-500/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)]">
                <span>Palette Preview</span>
                <span className="uppercase text-[9px] tracking-wider font-bold">
                  {item.isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-6">
                <div
                  className="rounded border border-black/10 flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: item.colors.background, color: item.colors.text }}
                  title="Canvas Background"
                >
                  BG
                </div>
                <div
                  className="rounded border border-black/10 flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: item.colors.card, color: item.colors.text }}
                  title="Card Surface"
                >
                  Card
                </div>
                <div
                  className="rounded border border-black/10 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: item.colors.primary }}
                  title="Primary Brand Accent"
                >
                  Brand
                </div>
                <div
                  className="rounded border border-black/10 flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: item.colors.border, color: item.isDark ? '#FFFFFF' : '#64748B' }}
                  title="Border Color"
                >
                  Line
                </div>
                <div
                  className="rounded border border-black/10 flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: item.colors.highlight, color: item.colors.primary }}
                  title="Highlight Accent"
                >
                  Hi
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
