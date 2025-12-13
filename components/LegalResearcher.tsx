'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatPanel from './ChatPanel';

interface Props {
  onBack: () => void;
}

export default function LegalResearcher({ onBack }: Props) {
  const t = useTranslations('tools');
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [practiceArea, setPracticeArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleResearch = async () => {
    if (!query.trim()) {
      alert(t('researcher.pleaseEnter'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          jurisdiction,
          practiceArea,
          includeAnalysis: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`${t('common.error')}: ` + data.error);
      }
    } catch (error) {
      alert('Failed to conduct research');
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('researcher.title')}</h2>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('researcher.researchQuery')}
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('researcher.queryPlaceholder')}
            className="w-full h-24 sm:h-32 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('researcher.jurisdiction')}
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder={t('researcher.jurisdictionPlaceholder')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('researcher.practiceArea')}
            </label>
            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t('researcher.practiceAreas.all')}</option>
              <option value="Family Law">{t('researcher.practiceAreas.family')}</option>
              <option value="Consumer & Debt">{t('researcher.practiceAreas.consumer')}</option>
              <option value="Housing">{t('researcher.practiceAreas.housing')}</option>
              <option value="Wills & Estates">{t('researcher.practiceAreas.wills')}</option>
              <option value="Immigration">{t('researcher.practiceAreas.immigration')}</option>
              <option value="Traffic">{t('researcher.practiceAreas.traffic')}</option>
              <option value="Criminal">{t('researcher.practiceAreas.criminal')}</option>
              <option value="Civil">{t('researcher.practiceAreas.civil')}</option>
              <option value="Corporate">{t('researcher.practiceAreas.corporate')}</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? t('researcher.researching') : t('researcher.conductButton')}
        </button>

        {result && (
          <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{t('researcher.results')}</h3>

            <div className="mb-4 sm:mb-6 bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{t('researcher.query')}</p>
              <p className="font-semibold text-sm sm:text-base">{result.query}</p>
            </div>

            <div className="prose max-w-none text-sm sm:text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.analysis || result.results[0]?.fullText || 'No results found'}
              </ReactMarkdown>
            </div>

            {result.relatedQueries && result.relatedQueries.length > 0 && (
              <div className="mt-4 sm:mt-6 bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-bold text-base sm:text-lg mb-3">{t('researcher.relatedTopics')}</h4>
                <ul className="space-y-2">
                  {result.relatedQueries.map((relatedQuery: string, i: number) => (
                    <li key={i}>
                      <button
                        onClick={() => setQuery(relatedQuery)}
                        className="text-green-600 hover:text-green-700 hover:underline text-left text-sm sm:text-base"
                      >
                        {relatedQuery}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatPanel
        context={result ? JSON.stringify({ query, jurisdiction, practiceArea, result }) : query}
        toolType="researcher"
      />
    </div>
  );
}
