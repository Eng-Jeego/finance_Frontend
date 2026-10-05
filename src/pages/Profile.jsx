import React, { useState } from 'react';
import { User, Lock, Wallet, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { CURRENCIES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  // Profile Form state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    currency: user?.currency || 'USD',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      showToast('Full name cannot be empty', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        showToast('Profile information updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordData);
      showToast('Password updated successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings & Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, preferred currency, appearance, and security credentials.
        </p>
      </div>

      {/* User Info Overview Banner */}
      <Card bodyClassName="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md shadow-emerald-500/20">
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.fullName}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                <span>Joined {formatDate(user?.createdAt)}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Account</span>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <Card title="Personal Details" subtitle="Update name and preferred display currency">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email address cannot be changed directly."
            />

            <Select
              label="Default Currency"
              value={profileData.currency}
              onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
              options={CURRENCIES.map((c) => ({
                value: c.code,
                label: `${c.code} (${c.symbol}) - ${c.name}`,
              }))}
              placeholder={null}
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" loading={profileLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card title="Security & Password" subtitle="Ensure your account is using a secure password">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              icon={Lock}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              icon={Lock}
              value={passwordData.confirmNewPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
              }
              required
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="outline" loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Appearance / Theme Preferences Card */}
      <Card
        title="System Appearance & Theme"
        subtitle="Choose how PersonalFinance looks to you during the day and night"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
              theme === 'light'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Light Mode (Maalin)</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Bright appearance suitable for daytime use and high-visibility environments.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
              theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">Dark Mode (Habeen)</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Easy on the eyes, reduces glare, and perfect for nighttime or low-light usage.
              </p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
