'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import DocumentAnalyzer from '@/components/DocumentAnalyzer';
import LegalResearcher from '@/components/LegalResearcher';
import DocumentDrafter from '@/components/DocumentDrafter';
import DocumentReviewer from '@/components/DocumentReviewer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ToolsSidebar from '@/components/ToolsSidebar';

type ActiveTool = 'analyze' | 'research' | 'draft' | 'review' | null;
type SidebarTool = 'analyzer' | 'researcher' | 'drafter' | 'reviewer';

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const t = useTranslations();
  const locale = useLocale();

  // Convert between activeTool and sidebarTool naming conventions
  const toolToSidebar = (tool: ActiveTool): SidebarTool | null => {
    const mapping: Record<string, SidebarTool> = {
      'analyze': 'analyzer',
      'research': 'researcher',
      'draft': 'drafter',
      'review': 'reviewer',
    };
    return tool ? mapping[tool] : null;
  };

  const sidebarToTool = (tool: SidebarTool): ActiveTool => {
    const mapping: Record<SidebarTool, ActiveTool> = {
      'analyzer': 'analyze',
      'researcher': 'research',
      'drafter': 'draft',
      'reviewer': 'review',
    };
    return mapping[tool];
  };

  const handleToolSelect = (tool: SidebarTool) => {
    setActiveTool(sidebarToTool(tool));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Tools Sidebar - Only shown when a tool is active */}
      {activeTool && toolToSidebar(activeTool) && (
        <ToolsSidebar
          currentTool={toolToSidebar(activeTool)!}
          onSelectTool={handleToolSelect}
        />
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{t('header.title')}</h1>
              <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">{t('header.subtitle')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className={`container mx-auto px-4 py-6 sm:py-8 flex-1 ${activeTool ? 'lg:ml-64' : ''}`}>
        {!activeTool && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                {t('hero.title')}
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                {t('hero.description')}
              </p>
            </div>

            {/* Specialized Use Cases Section */}
            <div className="mb-8 sm:mb-12 max-w-5xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center px-2">
                {t('specialized.title')}
              </h3>
              <a
                href={`https://crypto.gpulaw.com/${locale}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 rounded-xl shadow-2xl p-4 sm:p-8 cursor-pointer hover:shadow-3xl transition-all hover:-translate-y-1 border-2 border-blue-400/50 hover:border-blue-400 block"
              >
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-500 p-3 sm:p-4 rounded-xl shadow-lg">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-950" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3">
                      <div className="flex-1 w-full">
                        <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          <span>{t('specialized.crypto.title')}</span>
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-950 text-xs sm:text-sm font-semibold rounded-full inline-block">
                            {t('specialized.crypto.badge')}
                          </span>
                        </h3>
                        <p className="text-sm sm:text-lg text-blue-100 mb-3 sm:mb-4">
                          {t('specialized.crypto.description')}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-900/50 text-blue-300 font-medium text-xs sm:text-sm rounded-lg border-2 border-blue-400/50 hover:border-blue-400 transition-colors">
                            {t('specialized.crypto.tags.exchange')}
                          </span>
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-900/50 text-blue-300 font-medium text-xs sm:text-sm rounded-lg border-2 border-blue-400/50 hover:border-blue-400 transition-colors">
                            {t('specialized.crypto.tags.ico')}
                          </span>
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-900/50 text-blue-300 font-medium text-xs sm:text-sm rounded-lg border-2 border-blue-400/50 hover:border-blue-400 transition-colors">
                            {t('specialized.crypto.tags.aml')}
                          </span>
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-900/50 text-blue-300 font-medium text-xs sm:text-sm rounded-lg border-2 border-blue-400/50 hover:border-blue-400 transition-colors">
                            {t('specialized.crypto.tags.token')}
                          </span>
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-900/50 text-blue-300 font-medium text-xs sm:text-sm rounded-lg border-2 border-blue-400/50 hover:border-blue-400 transition-colors">
                            {t('specialized.crypto.tags.licensing')}
                          </span>
                        </div>
                      </div>
                      <svg className="hidden sm:block w-8 h-8 text-blue-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm sm:text-base">
                      <span>{t('specialized.crypto.cta')}</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Core Tools Section */}
            <div className="mb-6 sm:mb-8 max-w-5xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center px-2">
                {t('coreTools.title')}
              </h3>
            </div>

            {/* Tools Grid */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {/* Document Analyzer */}
              <div
                onClick={() => setActiveTool('analyze')}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {t('coreTools.analyzer.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      {t('coreTools.analyzer.description')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.analyzer.tags.fact')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.analyzer.tags.issue')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.analyzer.tags.party')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Researcher */}
              <div
                onClick={() => setActiveTool('research')}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {t('coreTools.researcher.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      {t('coreTools.researcher.description')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.researcher.tags.case')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.researcher.tags.statutes')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.researcher.tags.regulations')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Drafter */}
              <div
                onClick={() => setActiveTool('draft')}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {t('coreTools.drafter.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      {t('coreTools.drafter.description')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.drafter.tags.contracts')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.drafter.tags.motions')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.drafter.tags.briefs')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Reviewer */}
              <div
                onClick={() => setActiveTool('review')}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-500"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {t('coreTools.reviewer.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                      {t('coreTools.reviewer.description')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-orange-50 text-orange-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.reviewer.tags.review')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-orange-50 text-orange-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.reviewer.tags.grammar')}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-orange-50 text-orange-700 text-xs sm:text-sm rounded-full">
                        {t('coreTools.reviewer.tags.suggestions')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-12 sm:mt-16 bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-5xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-2">
                {t('features.title')}
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-base sm:text-lg mb-2">{t('features.precision.title')}</h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.precision.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-base sm:text-lg mb-2">{t('features.secure.title')}</h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.secure.description')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-base sm:text-lg mb-2">{t('features.timeSaving.title')}</h4>
                  <p className="text-sm sm:text-base text-gray-600">
                    {t('features.timeSaving.description')}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tool Components */}
        {activeTool === 'analyze' && <DocumentAnalyzer onBack={() => setActiveTool(null)} />}
        {activeTool === 'research' && <LegalResearcher onBack={() => setActiveTool(null)} />}
        {activeTool === 'draft' && <DocumentDrafter onBack={() => setActiveTool(null)} />}
        {activeTool === 'review' && <DocumentReviewer onBack={() => setActiveTool(null)} />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-gray-400 mb-2 text-sm sm:text-base">
              {t('footer.copyright')}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 px-4">
              <strong>{t('footer.disclaimer')}</strong> {t('footer.disclaimerText')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
