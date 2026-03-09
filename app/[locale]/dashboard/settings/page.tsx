'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  Shield,
  AlertTriangle,
  X,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const params = useParams();
  const locale = params.locale as string;
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleRevoke = async (id: string) => {
    if (!confirm(t('confirmRevoke'))) return;
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch {
      // Handle error
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreated = (key: ApiKeyItem & { rawKey: string }) => {
    setNewRawKey(key.rawKey);
    setKeys((prev) => [key, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t('title')}
            </h1>
            <p className="text-slate-600">{t('subtitle')}</p>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">{t('apiKeys')}</h2>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('createKey')}
            </button>
          </div>

          {/* New key banner */}
          {newRawKey && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-800 text-sm mb-2">
                    {t('keyCopyWarning')}
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded border border-green-300 p-2">
                    <code className="flex-1 text-xs text-slate-800 break-all font-mono">
                      {newRawKey}
                    </code>
                    <button
                      onClick={() => handleCopy(newRawKey)}
                      className="shrink-0 p-1.5 hover:bg-slate-100 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setNewRawKey(null)}
                  className="shrink-0 p-1 hover:bg-green-100 rounded"
                >
                  <X className="h-4 w-4 text-green-600" />
                </button>
              </div>
            </div>
          )}

          {/* Keys list */}
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              {t('loading')}
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Key className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm">{t('noKeys')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('noKeysDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 text-sm">{key.name}</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{key.keyPrefix}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {key.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {p}
                        </span>
                      ))}
                      {key.expiresAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {t('expires')}: {new Date(key.expiresAt).toLocaleDateString(locale)}
                        </span>
                      )}
                      {key.lastUsedAt && (
                        <span className="text-xs text-slate-400">
                          {t('lastUsed')}: {new Date(key.lastUsedAt).toLocaleDateString(locale)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="self-start sm:self-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('revoke')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">{t('usage')}</h2>
          </div>
          <div className="prose prose-sm text-slate-600">
            <p>{t('usageDesc')}</p>
            <pre className="bg-slate-50 p-3 rounded text-xs overflow-x-auto">
{`curl -H "Authorization: Bearer sk_live_YOUR_KEY" \\
  https://gpulaw.com/api/chat`}
            </pre>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: ApiKeyItem & { rawKey: string }) => void;
}) {
  const t = useTranslations('dashboard.settings');
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([
    'chat',
    'research',
    'documents',
    'cases',
    'profile',
  ]);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const allPermissions = ['chat', 'research', 'documents', 'cases', 'profile'];

  const togglePermission = (p: string) => {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }
    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          permissions,
          expiresInDays: expiresInDays || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create key');
        return;
      }

      const data = await res.json();
      onCreated(data.key);
    } catch {
      setError('Network error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{t('createKey')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('keyName')} *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('keyNamePlaceholder')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('permissions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePermission(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    permissions.includes(p)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-300 text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('expiration')}
            </label>
            <select
              value={expiresInDays}
              onChange={(e) =>
                setExpiresInDays(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('noExpiration')}</option>
              <option value="30">30 {t('days')}</option>
              <option value="90">90 {t('days')}</option>
              <option value="180">180 {t('days')}</option>
              <option value="365">365 {t('days')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              <Key className="h-4 w-4" />
              {creating ? t('creating') : t('createKey')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
