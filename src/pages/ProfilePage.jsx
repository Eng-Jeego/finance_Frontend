import { useState } from 'react';
import { authApi } from '../services/authApi';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CURRENCIES } from '../constants';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { Input, Select } from '../components/ui/FormField';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const { notify } = useToast();
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName || '',
    currency: currentUser?.currency || 'USD',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(profile);
      setCurrentUser(data.data.user);
      notify('Profile updated');
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to update profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      notify('New passwords do not match', 'error');
      return;
    }
    setChanging(true);
    try {
      await authApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      notify('Password changed');
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to change password'), 'error');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Profile" subtitle="Your name and display currency." />
        <form className="space-y-4 p-5" onSubmit={saveProfile}>
          <Input
            id="fullName"
            label="Full name"
            required
            value={profile.fullName}
            onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <Input id="email" label="Email" value={currentUser?.email || ''} disabled />
          <Select
            id="currency"
            label="Currency"
            value={profile.currency}
            onChange={(e) => setProfile((prev) => ({ ...prev, currency: e.target.value }))}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </Select>
          <Button type="submit" loading={saving}>Save profile</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <form className="space-y-4 p-5" onSubmit={changePassword}>
          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
          />
          <Input
            id="newPassword"
            type="password"
            label="New password"
            required
            value={passwords.newPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
          />
          <Input
            id="confirmNewPassword"
            type="password"
            label="Confirm new password"
            required
            value={passwords.confirmNewPassword}
            onChange={(e) => setPasswords((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
          />
          <Button type="submit" loading={changing}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
