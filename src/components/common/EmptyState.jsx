import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-200 ${className}`}>
      {Icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700 text-slate-400 dark:text-slate-500 mb-4">
          <Icon className="h-7 w-7 stroke-[1.5]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
