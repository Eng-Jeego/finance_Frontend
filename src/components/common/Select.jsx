import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      name,
      options = [],
      placeholder = 'Select an option',
      error,
      helperText,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={name}
          name={name}
          className={`block w-full rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 py-2.5 px-3.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
            error
              ? 'border-rose-300 dark:border-rose-500/60 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950/50'
              : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-950/50'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="" className="dark:bg-slate-900 dark:text-slate-400">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="dark:bg-slate-900 dark:text-slate-100">
                {text}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
