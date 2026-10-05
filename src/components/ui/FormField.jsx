import { cn } from '../../utils/cn';

export function Input({
  id,
  label,
  error,
  hint,
  className,
  required,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-950/50',
          error && 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950/50',
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ id, label, error, required, children, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-950/50',
          error && 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-950/50',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-500 dark:text-red-400">{error}</p> : null}
    </div>
  );
}

export function Textarea({ id, label, error, required, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'min-h-[88px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-950/50',
          className
        )}
        {...props}
      />
      {error ? <p className="text-xs text-red-500 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
