'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  onBack: () => void;
}

export default function DocumentDrafter({ onBack }: Props) {
  const [documentType, setDocumentType] = useState('contract');
  const [purpose, setPurpose] = useState('');
  const [parties, setParties] = useState('');
  const [facts, setFacts] = useState('');
  const [jurisdiction, setJurisdiction] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDraft = async () => {
    if (!purpose.trim()) {
      alert('Please describe the purpose of the document');
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
        alert('Error: ' + data.error);
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
      alert('Document copied to clipboard');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Document Drafter</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="contract">Contract</option>
              <option value="letter">Legal Letter</option>
              <option value="motion">Motion</option>
              <option value="brief">Brief</option>
              <option value="settlement">Settlement Agreement</option>
              <option value="complaint">Complaint</option>
              <option value="opinion">Legal Opinion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurisdiction
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g., California, New York, Federal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Document *
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Describe the purpose and what this document should accomplish..."
            className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parties (one per line, format: Name: Role)
          </label>
          <textarea
            value={parties}
            onChange={(e) => setParties(e.target.value)}
            placeholder="John Doe: Plaintiff&#10;Jane Smith: Defendant"
            className="w-full h-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relevant Facts (one per line)
          </label>
          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            placeholder="Contract signed on January 1, 2025&#10;Breach occurred on February 15, 2025&#10;Damages amount to $50,000"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleDraft}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Drafting...' : 'Draft Document'}
        </button>

        {result && (
          <div className="mt-8 border-t pt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Drafted Document</h3>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap font-mono text-sm">{result.document}</pre>
            </div>

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-3 text-purple-900">Suggestions for Review</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="text-purple-800">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3 text-yellow-900">Important Warnings</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.warnings.map((warning: string, i: number) => (
                    <li key={i} className="text-yellow-800">{warning}</li>
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
