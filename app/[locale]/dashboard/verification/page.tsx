'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X,
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

type Verification = {
  id: string;
  firstName: string;
  lastName: string;
  barNumber: string;
  barState: string;
  yearsExperience: number;
  status: string;
  verificationNotes: string | null;
  approvedAt: string | null;
  documents: DocumentEntry[];
  createdAt: string;
  updatedAt: string;
};

const DOCUMENT_TYPES = ['BAR_CERTIFICATE', 'MALPRACTICE_INSURANCE', 'ID_VERIFICATION'] as const;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export default function VerificationPage() {
  const t = useTranslations();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [barState, setBarState] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [pendingFiles, setPendingFiles] = useState<Array<{ type: string; file: File }>>([]);

  useEffect(() => {
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/verification');
      if (!response.ok) throw new Error('Failed to fetch verification status');
      const data = await response.json();
      const v = data.verification;
      setVerification(v);
      if (v) {
        setFirstName(v.firstName || '');
        setLastName(v.lastName || '');
        setBarNumber(v.barNumber || '');
        setBarState(v.barState || '');
        setYearsExperience(v.yearsExperience ? String(v.yearsExperience) : '');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load verification status';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFiles((prev) => {
      const filtered = prev.filter((f) => f.type !== type);
      return [...filtered, { type, file }];
    });
  };

  const removePendingFile = (type: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.type !== type));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const documents = pendingFiles.map((pf) => ({
        type: pf.type,
        fileName: pf.file.name,
        fileSize: pf.file.size,
        mimeType: pf.file.type,
      }));

      const response = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          barNumber,
          barState,
          yearsExperience: parseInt(yearsExperience) || 0,
          documents,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit verification');
      }

      const data = await response.json();
      setVerification(data.verification);
      setPendingFiles([]);
      setSuccess(t('dashboard.verification.submitSuccess'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit verification';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'VERIFIED':
        return <ShieldCheck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const isApproved = verification?.status === 'APPROVED';
  const isRejected = verification?.status === 'REJECTED';

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {t('dashboard.verification.title')}
          </h1>
          <p className="text-slate-600">
            {t('dashboard.verification.subtitle')}
          </p>
        </div>

        {/* Approved banner */}
        {isApproved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-green-900">
                  {t('dashboard.verification.approvedTitle')}
                </h2>
                <p className="text-green-700">
                  {t('dashboard.verification.approvedDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected banner */}
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">
                  {t('dashboard.verification.rejectedTitle')}
                </h2>
                <p className="text-red-700">
                  {verification?.verificationNotes || t('dashboard.verification.rejectedDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {t('dashboard.verification.statusTimeline')}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
            {(['PENDING_VERIFICATION', 'VERIFIED', 'APPROVED'] as const).map((step, i) => {
              const currentIdx = ['PENDING_VERIFICATION', 'VERIFIED', 'APPROVED'].indexOf(
                verification?.status || 'PENDING_VERIFICATION'
              );
              const stepIdx = i;
              const isComplete = stepIdx < currentIdx || verification?.status === 'APPROVED';
              const isCurrent = stepIdx === currentIdx && verification?.status !== 'REJECTED';

              return (
                <div key={step} className="flex items-center gap-2 sm:flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                      isComplete
                        ? 'bg-green-600 border-green-600 text-white'
                        : isCurrent
                          ? 'border-blue-600 text-blue-600'
                          : 'border-slate-300 text-slate-300'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isComplete || isCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {t(`dashboard.verification.steps.${step}`)}
                  </span>
                  {i < 2 && (
                    <div
                      className={`hidden sm:block flex-1 h-0.5 mx-3 ${
                        isComplete ? 'bg-green-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Badge */}
        {verification && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3">
              {getStatusIcon(verification.status)}
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.verification.currentStatus')}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`}>
                  {t(`dashboard.verification.statuses.${verification.status}`)}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 mb-6">
            {success}
          </div>
        )}

        {/* Verification Form */}
        {!isApproved && (
          <form onSubmit={handleSubmit}>
            {/* Professional Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {t('dashboard.verification.professionalInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('dashboard.verification.firstName')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('dashboard.verification.lastName')}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('dashboard.verification.barNumber')}
                  </label>
                  <input
                    type="text"
                    value={barNumber}
                    onChange={(e) => setBarNumber(e.target.value)}
                    placeholder="e.g., CA-123456"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('dashboard.verification.barState')}
                  </label>
                  <select
                    value={barState}
                    onChange={(e) => setBarState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('dashboard.verification.selectState')}</option>
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('dashboard.verification.yearsExperience')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {t('dashboard.verification.documentsTitle')}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {t('dashboard.verification.storageNote')}
              </p>

              <div className="space-y-4">
                {DOCUMENT_TYPES.map((docType) => {
                  const existingDoc = verification?.documents.find((d) => d.type === docType);
                  const pendingFile = pendingFiles.find((f) => f.type === docType);

                  return (
                    <div key={docType} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-slate-500" />
                          <span className="font-medium text-slate-900">
                            {t(`dashboard.verification.docTypes.${docType}`)}
                          </span>
                        </div>
                        {existingDoc?.isVerified && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {t('dashboard.verification.verified')}
                          </span>
                        )}
                      </div>

                      {existingDoc && !pendingFile && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{existingDoc.fileName}</span>
                          <span className="text-slate-400">({formatFileSize(existingDoc.fileSize)})</span>
                        </div>
                      )}

                      {pendingFile && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                          <Upload className="h-4 w-4" />
                          <span>{pendingFile.file.name}</span>
                          <span className="text-slate-400">({formatFileSize(pendingFile.file.size)})</span>
                          <button
                            type="button"
                            onClick={() => removePendingFile(docType)}
                            className="ml-auto text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-slate-700">
                        <Upload className="h-4 w-4" />
                        {existingDoc || pendingFile
                          ? t('dashboard.verification.replaceFile')
                          : t('dashboard.verification.selectFile')}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(docType, e)}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !barNumber || !barState}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('dashboard.verification.submitting')}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    {t('dashboard.verification.submitVerification')}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Uploaded Documents List (if approved) */}
        {isApproved && verification?.documents && verification.documents.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {t('dashboard.verification.uploadedDocs')}
            </h2>
            <div className="space-y-3">
              {verification.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {t(`dashboard.verification.docTypes.${doc.type}`)} - {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  {doc.isVerified && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
