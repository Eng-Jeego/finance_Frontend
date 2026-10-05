import { cn } from '../../utils/cn';

export function Card({ children, className }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
