'use client';

import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { ArrowLeft, Sparkles, Download, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function GeneratePageInner() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    documentType: 'CONTRACT',
    jurisdiction: '',
    clientName: searchParams.get('clientName') || '',
    userPrompt: searchParams.get('prompt') || '',
    additionalContext: searchParams.get('context') || '',
    language: searchParams.get('language') || (locale === 'zh-TW' ? 'zh-TW' : locale === 'zh-CN' ? 'zh-CN' : 'en'),
  });

  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const documentTypes = [
    'CONTRACT', 'LEGAL_OPINION', 'MOTION', 'BRIEF', 'COMPLAINT',
    'SETTLEMENT', 'LETTER', 'MEMO',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: searchParams.get('caseId'),
          documentType: formData.documentType,
          jurisdiction: formData.jurisdiction,
          clientName: formData.clientName,
          userPrompt: formData.userPrompt,
          additionalContext: formData.additionalContext,
          language: formData.language,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate document');
      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${formData.documentType.toLowerCase()}_${Date.now()}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/documents`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard.documents.backToDocs')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t('dashboard.documents.generateWithAI')}
          </h1>
          <p className="text-slate-600">{t('dashboard.documents.generateDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <form onSubmit={handleGenerate} className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('dashboard.documents.docType')}
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(`dashboard.documents.types.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('dashboard.documents.jurisdiction')}
                </label>
                <input
                  type="text"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                  placeholder={t('dashboard.documents.jurisdictionPlaceholder')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('dashboard.cases.clientName')}
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder={t('dashboard.cases.clientNamePlaceholder')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

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
                  rows={3}
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? t('dashboard.documents.generating') : t('dashboard.documents.generateDoc')}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.documents.preview')}</h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? t('tools.common.copied') : t('tools.common.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {t('dashboard.documents.download')}
                  </button>
                </div>
              )}
            </div>
            <div className="prose prose-sm max-w-none min-h-[400px]">
              {isGenerating ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-slate-600">{t('dashboard.documents.generating')}</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <ReactMarkdown>{generatedContent}</ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-slate-400">
                  <p>{t('dashboard.documents.previewEmpty')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GeneratePageInner />
    </Suspense>
  );
}
