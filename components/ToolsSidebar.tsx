'use client';

import { useTranslations, useLocale } from 'next-intl';

interface Props {
  currentTool: 'analyzer' | 'researcher' | 'drafter' | 'reviewer';
  onSelectTool: (tool: 'analyzer' | 'researcher' | 'drafter' | 'reviewer') => void;
}

export default function ToolsSidebar({ currentTool, onSelectTool }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const tools = [
    {
      id: 'analyzer' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: t('coreTools.analyzer.title'),
      color: 'blue',
    },
    {
      id: 'researcher' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: t('coreTools.researcher.title'),
      color: 'green',
    },
    {
      id: 'drafter' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: t('coreTools.drafter.title'),
      color: 'purple',
    },
    {
      id: 'reviewer' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: t('coreTools.reviewer.title'),
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
      green: isActive
        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
        : 'text-gray-600 hover:bg-green-50 hover:text-green-600',
      purple: isActive
        ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600',
      orange: isActive
        ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-600'
        : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t('coreTools.title')}
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          {t('header.subtitle')}
        </p>

        <nav className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${getColorClasses(
                tool.color,
                currentTool === tool.id
              )}`}
            >
              {tool.icon}
              <span className="text-sm font-medium">{tool.title}</span>
            </button>
          ))}
        </nav>

        {/* Specialized Use Cases Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
            {t('specialized.title')}
          </h3>
          <a
            href={`https://crypto.gpulaw.com/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-blue-950 to-blue-900 rounded-lg p-4 hover:shadow-lg transition-all hover:scale-[1.02] border border-blue-400/30 hover:border-blue-400/60"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-2 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-blue-950" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {t('specialized.crypto.title')}
                  </h4>
                  <svg className="w-4 h-4 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 bg-blue-900/60 text-blue-200 text-xs rounded border border-blue-400/30">
                    {t('specialized.crypto.badge')}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-xs font-semibold text-indigo-900 mb-1">
                  {t('footer.disclaimer')}
                </h3>
                <p className="text-xs text-indigo-700">
                  {t('footer.disclaimerText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
