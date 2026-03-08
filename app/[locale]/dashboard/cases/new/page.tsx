'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewCasePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    category: 'FAMILY_LAW',
    description: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'FAMILY_LAW',
    'CONSUMER_DEBT',
    'HOUSING_LANDLORD',
    'WILLS_ESTATES',
    'IMMIGRATION',
    'CORPORATE',
    'CRIMINAL',
    'CIVIL_LITIGATION',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create case');

      const data = await response.json();
      router.push(`/${locale}/dashboard/cases/${data.case.id}`);
    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(err.message || 'Failed to create case. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/cases`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard.cases.backToCases')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t('dashboard.cases.newCase')}
          </h1>
          <p className="text-slate-600">{t('dashboard.cases.newCaseDesc')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-slate-200 p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.cases.caseTitle')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('dashboard.cases.caseTitlePlaceholder')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.cases.clientName')} *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder={t('dashboard.cases.clientNamePlaceholder')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.cases.category')} *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`dashboard.cases.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.cases.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('dashboard.cases.descriptionPlaceholder')}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              <Save className="h-5 w-5" />
              {isSaving ? t('dashboard.cases.creating') : t('dashboard.cases.createCase')}
            </button>
            <Link
              href={`/${locale}/dashboard/cases`}
              className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t('dashboard.cases.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
