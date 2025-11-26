'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  onBack: () => void;
}

export default function DocumentAnalyzer({ onBack }: Props) {
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState('other');
  const [analysisType, setAnalysisType] = useState('full');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('Please enter document content');
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
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to analyze document');
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Document Analyzer</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="contract">Contract</option>
              <option value="email">Email</option>
              <option value="evidence">Evidence</option>
              <option value="motion">Motion</option>
              <option value="brief">Brief</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="full">Full Analysis</option>
              <option value="summary">Summary Only</option>
              <option value="issues">Issues Only</option>
              <option value="extract_facts">Extract Facts</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your document content here..."
            className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Document'}
        </button>

        {result && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h3>

            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.legalAnalysis || result.summary}
              </ReactMarkdown>
            </div>

            {result.extractedData && (
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-lg mb-3">Extracted Data</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Word Count</p>
                    <p className="font-semibold">{result.extractedData.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Document Type</p>
                    <p className="font-semibold">{result.extractedData.documentType}</p>
                  </div>
                </div>

                {result.dates && result.dates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Important Dates</p>
                    <ul className="list-disc list-inside">
                      {result.dates.slice(0, 5).map((d: any, i: number) => (
                        <li key={i} className="text-sm">
                          <strong>{d.date}:</strong> {d.event.substring(0, 100)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.extractedData.citations && result.extractedData.citations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Citations Found</p>
                    <ul className="list-disc list-inside">
                      {result.extractedData.citations.map((citation: string, i: number) => (
                        <li key={i} className="text-sm">{citation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
