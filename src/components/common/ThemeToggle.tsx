import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'pill' | 'segmented';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { theme, resolvedTheme, isDark, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
      { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
      { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
      { value: 'system', label: 'Auto', icon: <Monitor className="w-3.5 h-3.5" /> },
    ];

    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700/80 shadow-xs ${className}`}
        role="radiogroup"
        aria-label="Color theme switcher"
      >
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              role="radio"
              aria-checked={isActive}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            : 'bg-white hover:bg-slate-50 text-indigo-700 border-slate-200 shadow-xs'
        } ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}. Click to toggle.`}
      >
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }

  // Default: 'icon' button
  return (
    <button
      type="button"
      id="btn-theme-toggle"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all duration-200 active:scale-90 flex items-center gap-1.5 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 hover:text-amber-200 shadow-xs'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600 shadow-xs'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode (Current: ${resolvedTheme})`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`w-4 h-4 transition-all duration-300 absolute ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-4 h-4 transition-all duration-300 absolute ${
            isDark ? 'opacity-100 rotate-0 scale-100 text-amber-300' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold hidden sm:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
