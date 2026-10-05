import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-emerald-600 dark:text-emerald-400`} />
      {message && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
