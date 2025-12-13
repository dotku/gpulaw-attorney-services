'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ChatPanel from './ChatPanel';

interface Props {
  onBack: () => void;
}

interface Issue {
  type: string;
  severity: string;
  location: string;
  issue: string;
  suggestion: string;
  explanation?: string;
}

type ViewMode = 'original' | 'translation' | 'both';

export default function DocumentReviewer({ onBack }: Props) {
  const t = useTranslations('tools');
  const locale = useLocale();
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState('legal document');
  const [reviewType, setReviewType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Translation states
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedDocument, setTranslatedDocument] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'zh'>('zh');

  const handleReview = async () => {
    if (!content.trim()) {
      alert(t('reviewer.pleaseEnter'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/review-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          documentType,
          reviewType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert(`${t('common.error')}: ` + data.error);
      }
    } catch (error) {
      alert('Failed to review document');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!result?.revisedDocument && !content) {
      alert(t('reviewer.pleaseEnter'));
      return;
    }

    setTranslating(true);
    try {
      const textToTranslate = result?.revisedDocument || content;

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage: targetLanguage,
          sourceLanguage: targetLanguage === 'zh' ? 'en' : 'zh',
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.translatedText) {
        setTranslatedDocument(data.data.translatedText);
      } else {
        alert(`${t('common.error')}: ` + (data.error || 'Translation failed'));
        setTranslatedDocument('');
      }
    } catch (error) {
      alert(`${t('common.error')}: Translation service unavailable`);
      setTranslatedDocument('');
    } finally {
      setTranslating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'legal':
        return '⚖️';
      case 'factual':
        return '📋';
      case 'drafting':
        return '✍️';
      case 'grammar':
        return '📝';
      case 'formatting':
        return '📐';
      default:
        return '•';
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
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t('reviewer.title')}</h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviewer.documentType')}
            </label>
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder={t('reviewer.documentTypePlaceholder')}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviewer.reviewType')}
            </label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="comprehensive">{t('reviewer.reviewTypes.comprehensive')}</option>
              <option value="legal">{t('reviewer.reviewTypes.legal')}</option>
              <option value="grammar">{t('reviewer.reviewTypes.grammar')}</option>
              <option value="fact_check">{t('reviewer.reviewTypes.fact_check')}</option>
            </select>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('reviewer.documentContent')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('reviewer.placeholder')}
            className="w-full h-48 sm:h-64 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
          />
        </div>

        <button
          onClick={handleReview}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? t('reviewer.reviewing') : t('reviewer.reviewButton')}
        </button>

        {result && (
          <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('reviewer.results')}</h3>

            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <h4 className="font-bold text-base sm:text-lg text-orange-900">{t('reviewer.overallAssessment')}</h4>
                {result.strengthScore !== undefined && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-orange-700">{t('reviewer.strengthScore')}:</span>
                    <span className="font-bold text-xl sm:text-2xl text-orange-900">{result.strengthScore}/100</span>
                  </div>
                )}
              </div>
              <p className="text-orange-800 text-sm sm:text-base">{result.overallAssessment}</p>
            </div>

            {/* Issues */}
            {result.issues && result.issues.length > 0 ? (
              <div className="mb-4 sm:mb-6">
                <h4 className="font-bold text-base sm:text-lg mb-4">{t('reviewer.issuesIdentified')} ({result.issues.length})</h4>
                <div className="space-y-4">
                  {result.issues.map((issue: Issue, i: number) => (
                    <div
                      key={i}
                      className={`border-l-4 rounded-lg p-3 sm:p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-xl">{getTypeIcon(issue.type)}</span>
                          <span className="font-semibold capitalize text-sm sm:text-base">
                            {t(`reviewer.issueTypes.${issue.type}`) || issue.type}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-white bg-opacity-50 capitalize">
                            {t(`reviewer.severity.${issue.severity}`) || issue.severity}
                          </span>
                        </div>
                      </div>

                      <p className="font-medium mb-2 text-sm sm:text-base">{issue.issue}</p>

                      {issue.location && (
                        <div className="bg-white bg-opacity-50 rounded p-2 mb-2 text-xs sm:text-sm">
                          <span className="font-medium">{t('reviewer.location')}: </span>
                          <code className="text-xs">{issue.location}</code>
                        </div>
                      )}

                      <div className="mb-2">
                        <span className="font-medium text-xs sm:text-sm">{t('reviewer.suggestion')}: </span>
                        <span className="text-xs sm:text-sm">{issue.suggestion}</span>
                      </div>

                      {issue.explanation && (
                        <div className="text-xs sm:text-sm italic opacity-80">
                          {issue.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <p className="text-green-800 font-medium text-sm sm:text-base">
                  {t('reviewer.noIssues')}
                </p>
              </div>
            )}

            {/* General Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <h4 className="font-bold text-base sm:text-lg mb-3 text-blue-900">{t('reviewer.generalSuggestions')}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="text-blue-800 text-sm sm:text-base">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Translation Feature - Always visible when there's a result */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col gap-4 mb-4">
                {/* Translation Toggle and Controls */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="translation-toggle"
                        checked={translationEnabled}
                        onChange={(e) => setTranslationEnabled(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <label htmlFor="translation-toggle" className="font-semibold text-purple-900 cursor-pointer text-sm sm:text-base">
                        🌐 {t('reviewer.translation.enableTranslation')}
                      </label>
                    </div>

                    {translationEnabled && (
                      <>
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value as 'en' | 'zh')}
                          className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base bg-white"
                        >
                          <option value="zh">{t('reviewer.translation.chinese')}</option>
                          <option value="en">{t('reviewer.translation.english')}</option>
                        </select>

                        <button
                          onClick={handleTranslate}
                          disabled={translating}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 text-sm sm:text-base font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <span>{translating ? t('reviewer.translation.translating') : t('reviewer.translation.translateButton')}</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* View Mode Selector */}
                  {translationEnabled && translatedDocument && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-purple-900 self-center">{t('reviewer.translation.bilingualView')}:</span>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'original'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                        }`}
                      >
                        {t('reviewer.translation.showOriginal')}
                      </button>
                      <button
                        onClick={() => setViewMode('translation')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'translation'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                        }`}
                      >
                        {t('reviewer.translation.showTranslation')}
                      </button>
                      <button
                        onClick={() => setViewMode('both')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'both'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                        }`}
                      >
                        {t('reviewer.translation.showBoth')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Display - Always show original content */}
              {translationEnabled && translatedDocument ? (
                <div className={`grid ${viewMode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {/* Original Document */}
                  {(viewMode === 'original' || viewMode === 'both') && (
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-blue-200">
                      <h5 className="font-bold text-sm sm:text-base text-blue-900 mb-3 flex items-center">
                        <span className="mr-2">📄</span>
                        {t('reviewer.translation.originalText')}
                      </h5>
                      <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 leading-relaxed">
                        {result.revisedDocument || content}
                      </pre>
                    </div>
                  )}

                  {/* Translated Document */}
                  {(viewMode === 'translation' || viewMode === 'both') && (
                    <div className="bg-purple-50 rounded-lg p-4 sm:p-6 border-2 border-purple-300">
                      <h5 className="font-bold text-sm sm:text-base text-purple-900 mb-3 flex items-center">
                        <span className="mr-2">🌐</span>
                        {t('reviewer.translation.translatedText')}
                      </h5>
                      <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-purple-900 leading-relaxed">
                        {translatedDocument}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                /* Show original content when translation is not enabled */
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-gray-200">
                  <h5 className="font-bold text-sm sm:text-base text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📄</span>
                    {result.revisedDocument ? t('reviewer.revisedDocument') : t('reviewer.documentContent')}
                    {result.revisedDocument && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(result.revisedDocument);
                          alert(t('common.copied'));
                        }}
                        className="ml-auto px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{t('common.copy')}</span>
                      </button>
                    )}
                  </h5>
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 leading-relaxed">
                    {result.revisedDocument || content}
                  </pre>
                </div>
              )}
            </div>

            {/* Keep Revised Document section if it exists separately */}
            {false && result.revisedDocument && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col gap-4 mb-4">
                  {/* Header with Copy Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h4 className="font-bold text-base sm:text-lg">{t('reviewer.revisedDocument')}</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.revisedDocument);
                        alert(t('common.copied'));
                      }}
                      className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center justify-center space-x-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{t('common.copy')}</span>
                    </button>
                  </div>

                  {/* Translation Toggle and Controls */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="translation-toggle"
                          checked={translationEnabled}
                          onChange={(e) => setTranslationEnabled(e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <label htmlFor="translation-toggle" className="font-semibold text-purple-900 cursor-pointer text-sm sm:text-base">
                          🌐 {t('reviewer.translation.enableTranslation')}
                        </label>
                      </div>

                      {translationEnabled && (
                        <>
                          <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value as 'en' | 'zh')}
                            className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base bg-white"
                          >
                            <option value="zh">{t('reviewer.translation.chinese')}</option>
                            <option value="en">{t('reviewer.translation.english')}</option>
                          </select>

                          <button
                            onClick={handleTranslate}
                            disabled={translating}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2 text-sm sm:text-base font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span>{translating ? t('reviewer.translation.translating') : t('reviewer.translation.translateButton')}</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* View Mode Selector */}
                    {translationEnabled && translatedDocument && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-purple-900 self-center">{t('reviewer.translation.bilingualView')}:</span>
                        <button
                          onClick={() => setViewMode('original')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'original'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                          }`}
                        >
                          {t('reviewer.translation.showOriginal')}
                        </button>
                        <button
                          onClick={() => setViewMode('translation')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'translation'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                          }`}
                        >
                          {t('reviewer.translation.showTranslation')}
                        </button>
                        <button
                          onClick={() => setViewMode('both')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'both'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                          }`}
                        >
                          {t('reviewer.translation.showBoth')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Display - Single or Side-by-Side */}
                {translationEnabled && translatedDocument ? (
                  <div className={`grid ${viewMode === 'both' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {/* Original Document */}
                    {(viewMode === 'original' || viewMode === 'both') && (
                      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-blue-200">
                        <h5 className="font-bold text-sm sm:text-base text-blue-900 mb-3 flex items-center">
                          <span className="mr-2">📄</span>
                          {t('reviewer.translation.originalText')}
                        </h5>
                        <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 leading-relaxed">
                          {result.revisedDocument}
                        </pre>
                      </div>
                    )}

                    {/* Translated Document */}
                    {(viewMode === 'translation' || viewMode === 'both') && (
                      <div className="bg-purple-50 rounded-lg p-4 sm:p-6 border-2 border-purple-300">
                        <h5 className="font-bold text-sm sm:text-base text-purple-900 mb-3 flex items-center">
                          <span className="mr-2">🌐</span>
                          {t('reviewer.translation.translatedText')}
                        </h5>
                        <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-purple-900 leading-relaxed">
                          {translatedDocument}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Original Document Only (No Translation) */
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm">{result.revisedDocument}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      <ChatPanel
        context={result ? JSON.stringify({ content, documentType, reviewType, result }) : content}
        toolType="reviewer"
      />
    </div>
  );
}
