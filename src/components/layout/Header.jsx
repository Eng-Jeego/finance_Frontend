import { useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Header({ onMenu }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <p className="font-semibold text-slate-900">{currentUser?.fullName}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={onLogout}>
        <LogOut size={16} />
        Log out
      </Button>
    </header>
  );
}
