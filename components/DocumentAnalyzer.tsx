'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatPanel from './ChatPanel';

interface Props {
  onBack: () => void;
}

export default function DocumentAnalyzer({ onBack }: Props) {
  const t = useTranslations('tools');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [analysisType, setAnalysisType] = useState('full');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert(t('analyzer.pleaseEnter'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          documentType,
          analysisType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`${t('common.error')}: ` + data.error);
      }
    } catch (error) {
      alert('Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <button
        onClick={onBack}
        className="mb-4 sm:mb-6 px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2 text-sm sm:text-base"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>{t('common.backToTools')}</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('analyzer.title')}</h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analyzer.documentType')}
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="contract">{t('analyzer.types.contract')}</option>
              <option value="email">{t('analyzer.types.email')}</option>
              <option value="evidence">{t('analyzer.types.evidence')}</option>
              <option value="motion">{t('analyzer.types.motion')}</option>
              <option value="brief">{t('analyzer.types.brief')}</option>
              <option value="complaint">{t('analyzer.types.complaint')}</option>
              <option value="other">{t('analyzer.types.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('analyzer.analysisType')}
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="full">{t('analyzer.analysisTypes.full')}</option>
              <option value="summary">{t('analyzer.analysisTypes.summary')}</option>
              <option value="issues">{t('analyzer.analysisTypes.issues')}</option>
              <option value="extract_facts">{t('analyzer.analysisTypes.extract_facts')}</option>
            </select>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('analyzer.documentContent')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('analyzer.placeholder')}
            className="w-full h-48 sm:h-64 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? t('analyzer.analyzing') : t('analyzer.analyzeButton')}
        </button>

        {result && (
          <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t('analyzer.results')}</h3>

            <div className="prose max-w-none text-sm sm:text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.legalAnalysis || result.summary}
              </ReactMarkdown>
            </div>

            {result.extractedData && (
              <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-bold text-base sm:text-lg mb-3">{t('analyzer.extractedData')}</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-sm text-gray-600">{t('analyzer.wordCount')}</p>
                    <p className="font-semibold">{result.extractedData.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('analyzer.documentType')}</p>
                    <p className="font-semibold">{result.extractedData.documentType}</p>
                  </div>
                </div>

                {result.dates && result.dates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">{t('analyzer.importantDates')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.dates.slice(0, 5).map((d: any, i: number) => (
                        <li key={i} className="text-xs sm:text-sm">
                          <strong>{d.date}:</strong> {d.event.substring(0, 100)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.extractedData.citations && result.extractedData.citations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">{t('analyzer.citationsFound')}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.extractedData.citations.map((citation: string, i: number) => (
                        <li key={i} className="text-xs sm:text-sm">{citation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatPanel
        context={result ? JSON.stringify({ content, result }) : content}
        toolType="analyzer"
      />
    </div>
  );
}
