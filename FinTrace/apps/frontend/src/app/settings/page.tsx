// Settings Page

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavBar, Card, CardHeader, CardTitle, CardContent, Button } from '@/components';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    notifications: true,
    darkMode: true,
  });

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        notifications: true,
        darkMode: true,
      });
    }
  }, [user]);

  const handleSave = () => {
    alert('Settings saved successfully');
  };

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <NavBar showNav title="FinTrace" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-slate-400">Manage your account preferences and system configuration.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-2 text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-white">Enable email notifications for critical alerts</span>
              </label>

              <p className="text-sm text-slate-500">Critical alerts will be sent to your registered email address immediately.</p>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={formData.darkMode} className="w-4 h-4 rounded" disabled />
                <span className="text-white">Dark mode (always enabled)</span>
              </label>

              <p className="text-sm text-slate-500">FinTrace uses dark mode for optimal viewing experience and reduced eye strain.</p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary">Change Password</Button>
              <p className="text-sm text-slate-500">Update your password to maintain account security.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
