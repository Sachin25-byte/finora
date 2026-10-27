import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Globe, Shield, Save, CheckCircle2, AlertTriangle, Palette } from 'lucide-react';
import { SettingsThemeGrid } from '../components/ui/ThemeSwitcher';

export default function SettingsPage() {
  const { profile, user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await updateProfile({
      full_name: fullName,
      currency,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Workspace settings saved successfully!' });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-4xl fade-in pb-8">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--primary)]" /> Settings & Workspace Preferences
        </h1>
        <p className="page-subtitle">Configure theme appearance, user credentials, regional currency, and sync options</p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
              : 'bg-red-500/10 border-red-500/30 text-red-600'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Color Themes & Appearance Section */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-main)]">Color Themes & Visual Style</h2>
            <p className="text-xs text-[var(--text-muted)]">Choose from 4 designed themes. Updates instantly and persists across sessions.</p>
          </div>
        </div>

        <SettingsThemeGrid />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">User Profile</h2>
              <p className="text-xs text-[var(--text-muted)]">Personal details for transaction signing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Your Full Name"
              />
            </div>

            <div>
              <label className="label-text">Account Email</label>
              <input
                type="email"
                value={user?.email || profile?.email || 'user@finora.local'}
                disabled
                className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Currency & Locale */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">Localization & Currency</h2>
              <p className="text-xs text-[var(--text-muted)]">Number formatting and regional standards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="select-field font-semibold"
              >
                <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="label-text">Timezone Standard</label>
              <input
                type="text"
                value="Asia/Kolkata (IST +05:30)"
                disabled
                className="input-field bg-[var(--bg-muted)] text-[var(--text-muted)] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-main)]">Security & Database Encryption</h2>
              <p className="text-xs text-[var(--text-muted)]">Data protection and persistent storage</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Finora connects to Supabase PostgreSQL with automated Row-Level Security (RLS). When in offline mode, data is securely isolated in your local workspace sandbox.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4 stroke-[2.5]" /> {saving ? 'Saving...' : 'Save Workspace Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
