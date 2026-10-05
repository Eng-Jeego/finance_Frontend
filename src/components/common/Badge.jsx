import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  color,
  className = '',
}) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    info: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const customStyle = color
    ? {
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }
    : undefined;

  return (
    <span
      style={customStyle}
      className={`inline-flex items-center font-medium rounded-lg border ${
        color ? '' : variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
