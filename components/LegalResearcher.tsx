'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  onBack: () => void;
}

export default function LegalResearcher({ onBack }: Props) {
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [practiceArea, setPracticeArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleResearch = async () => {
    if (!query.trim()) {
      alert('Please enter a research query');
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
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to conduct research');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Tools</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Legal Researcher</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Query
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What legal question do you need to research? (e.g., 'statute of limitations for contract breach in California')"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurisdiction
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g., California, New York, Federal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practice Area (Optional)
            </label>
            <select
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Practice Areas</option>
              <option value="Family Law">Family Law</option>
              <option value="Consumer & Debt">Consumer & Debt</option>
              <option value="Housing">Housing & Landlord-Tenant</option>
              <option value="Wills & Estates">Wills, Estates & Probate</option>
              <option value="Immigration">Immigration</option>
              <option value="Traffic">Traffic Cases</option>
              <option value="Criminal">Criminal Law</option>
              <option value="Civil">Civil Litigation</option>
              <option value="Corporate">Corporate Law</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Researching...' : 'Conduct Research'}
        </button>

        {result && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Research Results</h3>

            <div className="mb-6 bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Query</p>
              <p className="font-semibold">{result.query}</p>
            </div>

            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.analysis || result.results[0]?.fullText || 'No results found'}
              </ReactMarkdown>
            </div>

            {result.relatedQueries && result.relatedQueries.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3">Related Research Topics</h4>
                <ul className="space-y-2">
                  {result.relatedQueries.map((relatedQuery: string, i: number) => (
                    <li key={i}>
                      <button
                        onClick={() => setQuery(relatedQuery)}
                        className="text-green-600 hover:text-green-700 hover:underline text-left"
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
    </div>
  );
}
