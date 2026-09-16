import React from 'react';
import { Menu, Plus, Bell, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/income': 'Income Management',
  '/expenses': 'Expense Management',
  '/budgets': 'Budget Planner',
  '/reports': 'Reports & Analytics',
  '/categories': 'Category Settings',
  '/profile': 'My Profile',
};

const Navbar = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Personal Finance';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Currency Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700">
          <span className="text-slate-400">Currency:</span>
          <span className="text-emerald-700">{user?.currency || 'USD'}</span>
        </div>

        {/* Quick Add Actions */}
        <div className="flex items-center gap-2">
          <Link to="/expenses">
            <Button variant="outline" size="sm" className="hidden md:inline-flex text-xs">
              + Expense
            </Button>
          </Link>
          <Link to="/income">
            <Button variant="primary" size="sm" className="text-xs">
              + Income
            </Button>
          </Link>
        </div>

        {/* Avatar link to profile */}
        <Link
          to="/profile"
          className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xs font-bold uppercase hover:ring-2 hover:ring-emerald-400 transition-all"
          title="Account Profile"
        >
          {user?.fullName ? user.fullName[0] : 'U'}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
