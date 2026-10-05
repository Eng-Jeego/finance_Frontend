import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts & Guards
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import Layout from './components/layout/Layout';

// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetails from './pages/AdminUserDetails';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Application Routes (All authenticated users) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/income" element={<Incomes />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Admin-Only Routes (role=ADMIN gate via AdminRoute) */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/users/:id" element={<AdminUserDetails />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
