'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, FileText, Sparkles, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type Document = {
  id: string;
  title: string;
  type: string;
  status: string;
  language: string;
  createdAt: Date | string;
  case?: { title: string; category: string };
};

export default function DocumentsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(
        data.documents.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
        }))
      );
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.case?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDownload = async (e: React.MouseEvent, docId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === 'undefined') return;

    setDownloadingId(docId);
    try {
      const response = await fetch(`/api/documents/${docId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      const content = data.document?.content;
      if (!content) throw new Error('No content');

      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.md`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-700',
      AI_GENERATED: 'bg-purple-100 text-purple-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      FINALIZED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || colors.DRAFT;
  };

  const documentTypes = [
    'LEGAL_OPINION', 'CONTRACT', 'MOTION', 'BRIEF', 'COMPLAINT',
    'SETTLEMENT', 'LETTER', 'MEMO',
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {t('dashboard.documents.title')}
            </h1>
            <p className="text-slate-600">{t('dashboard.documents.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/dashboard/documents/generate`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors self-start"
          >
            <Sparkles className="h-5 w-5" />
            {t('dashboard.documents.generateWithAI')}
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('dashboard.documents.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('dashboard.documents.allTypes')}</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`dashboard.documents.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Loader2 className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.documents.loading')}</h3>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-12 text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('dashboard.documents.noDocs')}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchQuery || typeFilter !== 'all'
                  ? t('dashboard.documents.adjustFilters')
                  : t('dashboard.documents.generateFirstDesc')}
              </p>
              {!searchQuery && typeFilter === 'all' && (
                <Link
                  href={`/${locale}/dashboard/documents/generate`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="h-5 w-5" />
                  {t('dashboard.documents.generateWithAI')}
                </Link>
              )}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/${locale}/dashboard/documents/${doc.id}`}
                className="block bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">{doc.title}</h3>
                      <p className="text-sm text-slate-600 truncate">{doc.case?.title || ''}</p>
                    </div>
                  </div>
                  {doc.status === 'AI_GENERATED' && (
                    <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {t(`dashboard.documents.statuses.${doc.status}`)}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {t(`dashboard.documents.types.${doc.type}`)}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs uppercase">{doc.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {(doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, doc.id, doc.title)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline disabled:opacity-60"
                    disabled={downloadingId === doc.id}
                  >
                    <Download className={`h-4 w-4 ${downloadingId === doc.id ? 'animate-spin' : ''}`} />
                    {downloadingId === doc.id ? t('dashboard.documents.downloading') : t('dashboard.documents.download')}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
