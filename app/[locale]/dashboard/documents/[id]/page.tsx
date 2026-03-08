'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Check, Edit, Save, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type DocumentDetail = {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  case?: { id: string; title: string };
};

export default function DocumentDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const docId = params.id as string;
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/documents/${docId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      setDoc(data.document);
      setEditContent(data.document.content);
    } catch {
      // Demo fallback
      const demoDoc = {
        id: docId,
        title: 'Employment Contract - Acme Corporation',
        content: `# Employment Contract\n\n## Parties\n\nThis Employment Agreement ("Agreement") is entered into as of March 7, 2026, by and between:\n\n**Employer:** Acme Corporation, a Delaware corporation\n**Employee:** John Smith\n\n## Terms of Employment\n\n### 1. Position\nThe Employee shall serve as Senior Software Engineer, reporting to the VP of Engineering.\n\n### 2. Compensation\n- Base Salary: $150,000 per annum\n- Bonus: Up to 15% of base salary\n- Equity: 10,000 stock options\n\n### 3. Benefits\n- Health, dental, and vision insurance\n- 401(k) with 4% employer match\n- 20 days paid time off\n\n### 4. Confidentiality\nEmployee agrees to maintain strict confidentiality of all proprietary information.\n\n### 5. Term\nThis Agreement shall commence on March 15, 2026, and shall continue until terminated by either party with 30 days written notice.\n\n---\n\n*This document was generated with AI assistance and should be reviewed by a licensed attorney before use.*`,
        type: 'CONTRACT',
        status: 'DRAFT',
        language: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        case: { id: '1', title: 'Acme Corp Employment Matters' },
      };
      setDoc(demoDoc);
      setEditContent(demoDoc.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!doc) return;
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc || typeof window === 'undefined') return;
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      if (response.ok) {
        setDoc({ ...doc, content: editContent });
        setIsEditing(false);
      }
    } catch {
      // Keep editing mode open
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/${locale}/dashboard/documents`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard.documents.backToDocs')}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{doc.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {t(`dashboard.documents.statuses.${doc.status}`)}
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                  {t(`dashboard.documents.types.${doc.type}`)}
                </span>
                {doc.case && (
                  <Link
                    href={`/${locale}/dashboard/cases/${doc.case.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {doc.case.title}
                  </Link>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? t('dashboard.documents.saving') : t('dashboard.documents.save')}
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditContent(doc.content); }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {t('dashboard.cases.cancel')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    {t('dashboard.documents.edit')}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? t('tools.common.copied') : t('tools.common.copy')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {t('dashboard.documents.download')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[600px] px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="prose prose-sm sm:prose max-w-none">
              <ReactMarkdown>{doc.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
