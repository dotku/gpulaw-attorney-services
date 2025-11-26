'use client';

import { useState } from 'react';

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

export default function DocumentReviewer({ onBack }: Props) {
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState('legal document');
  const [reviewType, setReviewType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleReview = async () => {
    if (!content.trim()) {
      alert('Please enter document content to review');
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
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to review document');
    } finally {
      setLoading(false);
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Document Reviewer</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., contract, motion, brief"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Type
            </label>
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="comprehensive">Comprehensive Review</option>
              <option value="legal">Legal Review Only</option>
              <option value="grammar">Grammar & Style Only</option>
              <option value="fact_check">Fact Check</option>
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
            placeholder="Paste your document content here for review..."
            className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleReview}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Reviewing...' : 'Review Document'}
        </button>

        {result && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Results</h3>

            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg text-orange-900">Overall Assessment</h4>
                {result.strengthScore !== undefined && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-orange-700">Strength Score:</span>
                    <span className="font-bold text-2xl text-orange-900">{result.strengthScore}/100</span>
                  </div>
                )}
              </div>
              <p className="text-orange-800">{result.overallAssessment}</p>
            </div>

            {/* Issues */}
            {result.issues && result.issues.length > 0 ? (
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-4">Issues Identified ({result.issues.length})</h4>
                <div className="space-y-4">
                  {result.issues.map((issue: Issue, i: number) => (
                    <div
                      key={i}
                      className={`border-l-4 rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getTypeIcon(issue.type)}</span>
                          <span className="font-semibold capitalize">{issue.type}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-white bg-opacity-50 capitalize">
                            {issue.severity}
                          </span>
                        </div>
                      </div>

                      <p className="font-medium mb-2">{issue.issue}</p>

                      {issue.location && (
                        <div className="bg-white bg-opacity-50 rounded p-2 mb-2 text-sm">
                          <span className="font-medium">Location: </span>
                          <code className="text-xs">{issue.location}</code>
                        </div>
                      )}

                      <div className="mb-2">
                        <span className="font-medium text-sm">Suggestion: </span>
                        <span className="text-sm">{issue.suggestion}</span>
                      </div>

                      {issue.explanation && (
                        <div className="text-sm italic opacity-80">
                          {issue.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <p className="text-green-800 font-medium">
                  ✓ No major issues found! The document appears to be well-drafted.
                </p>
              </div>
            )}

            {/* General Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-lg mb-3 text-blue-900">General Suggestions</h4>
                <ul className="list-disc list-inside space-y-2">
                  {result.suggestions.map((suggestion: string, i: number) => (
                    <li key={i} className="text-blue-800">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Revised Document */}
            {result.revisedDocument && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg">Revised Document</h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.revisedDocument);
                      alert('Revised document copied to clipboard');
                    }}
                    className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center space-x-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{result.revisedDocument}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
