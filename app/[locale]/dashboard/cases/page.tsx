'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, FolderOpen, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type Case = {
  id: string;
  title: string;
  clientName: string;
  category: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  description?: string;
};

export default function CasesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cases');
      if (!response.ok) throw new Error('Failed to fetch cases');
      const data = await response.json();
      setCases(
        data.cases.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }))
      );
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      setError(err.message || 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      REVIEW: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      ARCHIVED: 'bg-slate-100 text-slate-500',
    };
    return colors[status] || colors.DRAFT;
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t('dashboard.cases.title')}
            </h1>
            <p className="text-slate-600">{t('dashboard.cases.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/dashboard/cases/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-start"
          >
            <Plus className="h-5 w-5" />
            {t('dashboard.cases.newCase')}
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('dashboard.cases.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('dashboard.cases.allStatuses')}</option>
                <option value="DRAFT">{t('dashboard.cases.statuses.DRAFT')}</option>
                <option value="IN_PROGRESS">{t('dashboard.cases.statuses.IN_PROGRESS')}</option>
                <option value="REVIEW">{t('dashboard.cases.statuses.REVIEW')}</option>
                <option value="COMPLETED">{t('dashboard.cases.statuses.COMPLETED')}</option>
                <option value="ARCHIVED">{t('dashboard.cases.statuses.ARCHIVED')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Cases List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('dashboard.cases.loading')}
              </h3>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <FolderOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('dashboard.cases.noCases')}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? t('dashboard.cases.adjustFilters')
                  : t('dashboard.cases.createFirst')}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href={`/${locale}/dashboard/cases/new`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  {t('dashboard.cases.newCase')}
                </Link>
              )}
            </div>
          ) : (
            filteredCases.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/dashboard/cases/${c.id}`}
                className="block bg-white rounded-lg border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                      {c.title}
                    </h3>
                    <p className="text-sm text-slate-600">{c.clientName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(c.status)}`}>
                    {t(`dashboard.cases.statuses.${c.status}`)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {t(`dashboard.cases.categories.${c.category}`)}
                  </span>
                  <span className="text-xs">
                    {t('dashboard.cases.updated')}{' '}
                    {(c.updatedAt instanceof Date ? c.updatedAt : new Date(c.updatedAt)).toLocaleDateString(locale, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
