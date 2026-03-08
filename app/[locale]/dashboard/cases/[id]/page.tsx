'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Edit,
  Trash2,
  Clock,
  User,
  FolderOpen,
  Loader2,
} from 'lucide-react';

type CaseDetail = {
  id: string;
  title: string;
  clientName: string;
  category: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  documents: {
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
};

export default function CaseDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const fetchCase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) throw new Error('Failed to fetch case');
      const data = await response.json();
      setCaseData(data.case);
    } catch {
      // Use demo data as fallback
      setCaseData({
        id: caseId,
        title: 'Smith v. Johnson Partnership Dispute',
        clientName: 'John Smith',
        category: 'CIVIL_LITIGATION',
        status: 'IN_PROGRESS',
        description: 'Partnership dispute involving breach of fiduciary duty and misappropriation of partnership assets. Client seeks dissolution and accounting.',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [
          { id: '1', title: 'Complaint Draft', type: 'COMPLAINT', status: 'DRAFT', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { id: '2', title: 'Partnership Agreement Analysis', type: 'LEGAL_OPINION', status: 'APPROVED', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/cases`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard.cases.backToCases')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {caseData.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                  {t(`dashboard.cases.statuses.${caseData.status}`)}
                </span>
              </div>
              <p className="text-slate-600">
                {t(`dashboard.cases.categories.${caseData.category}`)}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
                {t('dashboard.cases.edit')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
                {t('dashboard.cases.delete')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {t('dashboard.cases.caseInfo')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {t('dashboard.cases.clientName')}
                  </label>
                  <p className="text-slate-900 mt-1">{caseData.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    {t('dashboard.cases.description')}
                  </label>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">
                    {caseData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {t('dashboard.documents.title')} ({caseData.documents.length})
                </h2>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('dashboard.documents.generateWithAI')}
                </button>
              </div>

              <div className="space-y-3">
                {caseData.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">{t('dashboard.documents.noDocs')}</p>
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t('dashboard.documents.generateFirst')}
                    </button>
                  </div>
                ) : (
                  caseData.documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/${locale}/dashboard/documents/${doc.id}`}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">{doc.title}</p>
                          <p className="text-sm text-slate-600">
                            {t(`dashboard.documents.types.${doc.type}`)} &middot;{' '}
                            {new Date(doc.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {t(`dashboard.documents.statuses.${doc.status}`)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">{t('dashboard.cases.quickActions')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('dashboard.documents.generateDoc')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">{t('dashboard.cases.details')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{t('dashboard.cases.clientLabel')}:</span>
                  <span className="font-medium text-slate-900">{caseData.clientName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FolderOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{t('dashboard.cases.categoryLabel')}:</span>
                  <span className="font-medium text-slate-900">
                    {t(`dashboard.cases.categories.${caseData.category}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{t('dashboard.cases.createdLabel')}:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(caseData.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{t('dashboard.cases.updatedLabel')}:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(caseData.updatedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Document Modal */}
      {showGenerateModal && (
        <GenerateDocumentModal
          caseData={caseData}
          onClose={() => setShowGenerateModal(false)}
          locale={locale}
        />
      )}
    </div>
  );
}

function GenerateDocumentModal({
  caseData,
  onClose,
  locale,
}: {
  caseData: CaseDetail;
  onClose: () => void;
  locale: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState({
    userPrompt: '',
    additionalContext: caseData.description,
    language: locale === 'zh-TW' ? 'zh-TW' : locale === 'zh-CN' ? 'zh-CN' : 'en',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const queryParams = new URLSearchParams({
      caseId: caseData.id,
      category: caseData.category,
      clientName: caseData.clientName,
      prompt: formData.userPrompt,
      context: formData.additionalContext,
      language: formData.language,
    });

    router.push(`/${locale}/dashboard/documents/generate?${queryParams.toString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('dashboard.documents.generateWithAI')}
          </h2>
          <p className="text-slate-600 mt-1">
            {t('dashboard.documents.forCase')}: {caseData.title}
          </p>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.documents.whatDocNeed')} *
            </label>
            <textarea
              required
              value={formData.userPrompt}
              onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
              placeholder={t('dashboard.documents.docPromptPlaceholder')}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.documents.additionalContext')}
            </label>
            <textarea
              value={formData.additionalContext}
              onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('dashboard.documents.language')}
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              {isGenerating ? t('dashboard.documents.generating') : t('dashboard.documents.generateDoc')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {t('dashboard.cases.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
