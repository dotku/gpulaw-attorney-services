'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldX,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Clock,
} from 'lucide-react';

type DocumentEntry = {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  isVerified: boolean;
};

type PendingLawyer = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  barNumber: string;
  barState: string;
  yearsExperience: number;
  status: string;
  documents: DocumentEntry[];
  createdAt: string;
};

export default function AdminVerificationsPage() {
  const t = useTranslations();
  const [lawyers, setLawyers] = useState<PendingLawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingLawyers();
  }, []);

  const fetchPendingLawyers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/verifications');
      if (!response.ok) throw new Error('Failed to fetch verifications');
      const data = await response.json();
      setLawyers(data.lawyers || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load verifications';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (lawyerId: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessingId(lawyerId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyerId,
          action,
          notes: rejectNotes[lawyerId] || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update verification');
      }

      // Remove the processed lawyer from the list
      setLawyers((prev) => prev.filter((l) => l.id !== lawyerId));
      setSuccessMessage(
        action === 'APPROVED'
          ? t('dashboard.adminVerifications.approveSuccess')
          : t('dashboard.adminVerifications.rejectSuccess')
      );
      setShowRejectForm(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update verification';
      setError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t('dashboard.adminVerifications.title')}
          </h1>
          <p className="text-slate-600">
            {t('dashboard.adminVerifications.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{lawyers.length}</p>
              <p className="text-sm text-slate-600">
                {t('dashboard.adminVerifications.pendingCount')}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 mb-6">
            {successMessage}
          </div>
        )}

        {/* Pending Lawyers List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">{t('dashboard.adminVerifications.loading')}</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t('dashboard.adminVerifications.noPending')}
            </h3>
            <p className="text-slate-600">
              {t('dashboard.adminVerifications.allReviewed')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
              >
                {/* Lawyer Info Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {lawyer.firstName} {lawyer.lastName}
                        </h3>
                        <p className="text-sm text-slate-600">{lawyer.email}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-4 w-4 mr-1" />
                      {t('dashboard.verification.statuses.PENDING_VERIFICATION')}
                    </span>
                  </div>
                </div>

                {/* Lawyer Details */}
                <div className="p-6 border-b border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {t('dashboard.verification.barNumber')}
                      </p>
                      <p className="font-medium text-slate-900">{lawyer.barNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {t('dashboard.verification.barState')}
                      </p>
                      <p className="font-medium text-slate-900">{lawyer.barState}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {t('dashboard.verification.yearsExperience')}
                      </p>
                      <p className="font-medium text-slate-900">
                        {lawyer.yearsExperience} {t('dashboard.adminVerifications.years')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-6 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    {t('dashboard.verification.documentsTitle')} ({lawyer.documents.length})
                  </h4>
                  {lawyer.documents.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      {t('dashboard.adminVerifications.noDocuments')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lawyer.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <FileText className="h-5 w-5 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {t(`dashboard.verification.docTypes.${doc.type}`)} -{' '}
                              {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reject notes form */}
                {showRejectForm === lawyer.id && (
                  <div className="p-6 border-b border-slate-100 bg-red-50">
                    <label className="block text-sm font-medium text-red-800 mb-2">
                      {t('dashboard.adminVerifications.rejectReason')}
                    </label>
                    <textarea
                      value={rejectNotes[lawyer.id] || ''}
                      onChange={(e) =>
                        setRejectNotes((prev) => ({ ...prev, [lawyer.id]: e.target.value }))
                      }
                      placeholder={t('dashboard.adminVerifications.rejectReasonPlaceholder')}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 flex flex-col sm:flex-row gap-3 justify-end">
                  {showRejectForm === lawyer.id ? (
                    <>
                      <button
                        onClick={() => setShowRejectForm(null)}
                        className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        {t('dashboard.cases.cancel')}
                      </button>
                      <button
                        onClick={() => handleAction(lawyer.id, 'REJECTED')}
                        disabled={processingId === lawyer.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                      >
                        {processingId === lawyer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {t('dashboard.adminVerifications.confirmReject')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowRejectForm(lawyer.id)}
                        disabled={processingId === lawyer.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-red-300 text-red-700 hover:bg-red-50 disabled:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ShieldX className="h-4 w-4" />
                        {t('dashboard.adminVerifications.reject')}
                      </button>
                      <button
                        onClick={() => handleAction(lawyer.id, 'APPROVED')}
                        disabled={processingId === lawyer.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                      >
                        {processingId === lawyer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {t('dashboard.adminVerifications.approve')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
