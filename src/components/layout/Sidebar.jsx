import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Tags,
  User,
  LogOut,
  Wallet,
  X,
  ShieldCheck,
  Users,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Expenses', href: '/expenses', icon: TrendingDown },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Profile', href: '/profile', icon: User },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ShieldCheck },
  { name: 'Users Management', href: '/admin/users', icon: Users },
  { name: 'System Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'System Settings', href: '/admin/settings', icon: Sliders },
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { logout, user, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-colors duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none block">
                PersunalFinance
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Management System
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {/* Admin Navigation Section (Only visible to ADMIN users) */}
          {isAdmin && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Administration
              </p>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <RouterNavLink
                    key={item.name}
                    to={item.href}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-5 h-5 transition-colors ${
                            isActive
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span>{item.name}</span>
                      </>
                    )}
                  </RouterNavLink>
                );
              })}
            </div>
          )}

          {/* User Financial Navigation */}
          <div className="space-y-1">
            {isAdmin && (
              <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Personal Finances
              </p>
            )}
            {userNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <RouterNavLink
                  key={item.name}
                  to={item.href}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </RouterNavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card & Logout in Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full ${
                  isAdmin ? 'bg-purple-600' : 'bg-emerald-600'
                } text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs`}
              >
                {user?.fullName ? user.fullName[0] : 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.fullName || 'User'}
                  </p>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
