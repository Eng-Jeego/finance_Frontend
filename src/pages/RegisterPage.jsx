import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/FormField';

export default function RegisterPage() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name';
    if (!form.email.includes('@')) next.email = 'Enter a valid email';
    if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      notify('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      notify(getErrorMessage(error, 'Unable to register'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">Ledgerly</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start tracking your personal finances.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Input id="fullName" name="fullName" label="Full name" required value={form.fullName} onChange={onChange} error={errors.fullName} />
          <Input id="email" name="email" type="email" label="Email" required value={form.email} onChange={onChange} error={errors.email} />
          <Input id="password" name="password" type="password" label="Password" required value={form.password} onChange={onChange} error={errors.password} />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            required
            value={form.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
