'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ChatPanel from './ChatPanel';

interface Props {
  onBack: () => void;
}

export default function DocumentDrafter({ onBack }: Props) {
  const t = useTranslations('tools');
  const [documentType, setDocumentType] = useState('contract');
  const [purpose, setPurpose] = useState('');
  const [parties, setParties] = useState('');
  const [facts, setFacts] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDraft = async () => {
    if (!purpose.trim()) {
      alert(t('drafter.pleaseEnter'));
      return;
    }

    setLoading(true);
    try {
      const partiesArray = parties.split('\n')
        .filter(p => p.trim())
        .map(p => {
          const parts = p.split(':');
          return {
            name: parts[0]?.trim() || '',
            role: parts[1]?.trim() || 'Party',
          };
        });

      const factsArray = facts.split('\n').filter(f => f.trim());

      const response = await fetch('/api/draft-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          purpose,
          parties: partiesArray,
          facts: factsArray,
          jurisdiction,
          tone: 'formal',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`${t('common.error')}: ` + data.error);
      }
    } catch (error) {
      alert('Failed to draft document');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.document) {
      navigator.clipboard.writeText(result.document);
      alert(t('common.copied'));
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('drafter.title')}</h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('drafter.documentType')}
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="contract">{t('drafter.types.contract')}</option>
              <option value="letter">{t('drafter.types.letter')}</option>
              <option value="motion">{t('drafter.types.motion')}</option>
              <option value="brief">{t('drafter.types.brief')}</option>
              <option value="settlement">{t('drafter.types.settlement')}</option>
              <option value="complaint">{t('drafter.types.complaint')}</option>
              <option value="opinion">{t('drafter.types.opinion')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('drafter.jurisdiction')}
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder={t('drafter.jurisdictionPlaceholder')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('drafter.purpose')} {t('drafter.required')}
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder={t('drafter.purposePlaceholder')}
            className="w-full h-20 sm:h-24 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('drafter.parties')}
          </label>
          <textarea
            value={parties}
            onChange={(e) => setParties(e.target.value)}
            placeholder={t('drafter.partiesPlaceholder')}
            className="w-full h-20 sm:h-24 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('drafter.facts')}
          </label>
          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            placeholder={t('drafter.factsPlaceholder')}
            className="w-full h-24 sm:h-32 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleDraft}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? t('drafter.drafting') : t('drafter.draftButton')}
        </button>

        {result && (
          <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('drafter.draftedDocument')}</h3>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{t('common.copy')}</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm">{result.document}</pre>
            </div>

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <h4 className="font-bold text-base sm:text-lg mb-3 text-purple-900">{t('drafter.suggestionsTitle')}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="text-purple-800 text-sm sm:text-base">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-bold text-base sm:text-lg mb-3 text-yellow-900">{t('drafter.warningsTitle')}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.warnings.map((warning: string, i: number) => (
                    <li key={i} className="text-yellow-800 text-sm sm:text-base">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatPanel
        context={result ? JSON.stringify({ documentType, purpose, parties, facts, jurisdiction, result }) : purpose}
        toolType="drafter"
      />
    </div>
  );
}
