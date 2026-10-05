import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404</h1>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
