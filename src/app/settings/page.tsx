'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Avatar from '@/components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';

type Preferences = {
  emailNotifications: boolean;
  tripReminders: boolean;
  journeyAutoSave: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  emailNotifications: true,
  tripReminders: true,
  journeyAutoSave: true
};

function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem('fitplan_preferences') || '{}') };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user && status === 'idle') dispatch(fetchCurrentUser());
    setPreferences(readPreferences());
  }, [dispatch, status, user]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setUsername(user.username ?? '');
    setBio(user.bio ?? '');
    setLocation(user.location ?? '');
    setWebsite(user.website ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
  }, [user]);

  const updatePreference = (key: keyof Preferences) => {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem('fitplan_preferences', JSON.stringify(next));
      return next;
    });
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/messages/upload', { method: 'POST', body: form });
    if (response.ok) {
      const data = await response.json();
      if (data.kind === 'image') setAvatarUrl(data.url);
      else setError('Please choose an image file.');
    } else setError('Could not upload profile photo.');
    setUploading(false);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const response = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, bio, location, website, avatarUrl })
    });
    const data = await response.json();
    if (response.ok) {
      dispatch(fetchCurrentUser());
      localStorage.setItem('fitplan_preferences', JSON.stringify(preferences));
      setMessage('Profile and settings saved successfully.');
    } else setError(data.message ?? 'Could not update profile.');
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-5 pb-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Account</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Settings</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage your profile and the basic preferences used by fitplan.</p>
        </header>

        {status === 'loading' && !user ? (
          <div className="h-80 animate-pulse rounded-[2rem] bg-white shadow-soft" />
        ) : (
          <form onSubmit={save} className="space-y-5">
            <section id="profile" className="scroll-mt-6 overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <div className="bg-ink px-5 py-7 text-white sm:px-8">
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <div className="relative">
                    <Avatar src={avatarUrl} alt={name || 'Profile photo'} size={88} />
                    <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-4 border-ink bg-accent text-sm shadow-card">
                      {uploading ? '…' : '✎'}
                      <input type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadAvatar(file); }} />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-extrabold">{name || 'Your name'}</p>
                    <p className="mt-0.5 text-sm text-white/60">@{username || 'username'}</p>
                    <p className="mt-2 max-w-xl text-sm text-white/75">{bio || 'Add a short bio about your travel style.'}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
                <label className="text-xs font-bold text-ink-soft">Full name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
                <label className="text-xs font-bold text-ink-soft">Username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
                <label className="text-xs font-bold text-ink-soft">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
                <label className="text-xs font-bold text-ink-soft">Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru, India" className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
                <label className="text-xs font-bold text-ink-soft sm:col-span-2">Website<input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-site.com" className="mt-1.5 w-full rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
                <label className="text-xs font-bold text-ink-soft sm:col-span-2">Bio <span className="font-normal">({bio.length}/160)</span><textarea value={bio} maxLength={160} onChange={(e) => setBio(e.target.value)} placeholder="Traveller, photographer, weekend explorer…" className="mt-1.5 min-h-28 w-full resize-y rounded-2xl bg-surface-muted p-4 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/20" /></label>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Basic preferences</p>
                <h2 className="mt-1 text-xl font-extrabold text-ink">App settings</h2>
              </div>
              <div className="mt-5 divide-y divide-surface-shell">
                {([
                  ['emailNotifications', 'Email notifications', 'Receive useful updates about your trips and account.'],
                  ['tripReminders', 'Trip reminders', 'Show reminders when an upcoming trip is getting close.'],
                  ['journeyAutoSave', 'Journey drafts', 'Keep Journey Memories ready for quick saving while you write.']
                ] as const).map(([key, title, description]) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div><p className="text-sm font-bold text-ink">{title}</p><p className="mt-0.5 text-xs leading-5 text-ink-soft">{description}</p></div>
                    <button type="button" role="switch" aria-checked={preferences[key]} onClick={() => updatePreference(key)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${preferences[key] ? 'bg-accent' : 'bg-surface-shell'}`}>
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${preferences[key] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {(message || error) && <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</p>}
            <button disabled={saving || uploading} className="w-full rounded-2xl bg-accent py-3.5 text-sm font-bold text-white shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
