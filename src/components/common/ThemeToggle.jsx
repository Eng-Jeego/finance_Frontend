import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2 rounded-xl text-sm',
    lg: 'p-2.5 rounded-xl text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center transition-all duration-200 border ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:border-slate-600 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80 shadow-xs'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle Dark/Light theme"
    >
      {isDark ? (
        <Sun className={`${iconSizes[size] || iconSizes.md} animate-in fade-in zoom-in duration-200 stroke-[2.2]`} />
      ) : (
        <Moon className={`${iconSizes[size] || iconSizes.md} animate-in fade-in zoom-in duration-200 stroke-[2.2]`} />
      )}
    </button>
  );
};

export default ThemeToggle;
