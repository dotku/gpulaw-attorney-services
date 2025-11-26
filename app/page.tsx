'use client';

import { useState } from 'react';
import DocumentAnalyzer from '@/components/DocumentAnalyzer';
import LegalResearcher from '@/components/LegalResearcher';
import DocumentDrafter from '@/components/DocumentDrafter';
import DocumentReviewer from '@/components/DocumentReviewer';

type ActiveTool = 'analyze' | 'research' | 'draft' | 'review' | null;

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">GPULaw Attorney Services</h1>
          <p className="text-blue-100 mt-2">AI-Powered Legal Tools for Precision Work</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!activeTool && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Professional Legal AI Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advanced AI-powered tools designed specifically for attorneys to analyze documents,
                conduct research, draft legal documents, and review work with unprecedented precision.
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Document Analyzer */}
              <div
                onClick={() => setActiveTool('analyze')}
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Document Analyzer
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Analyze emails, contracts, evidence, and legal documents. Extract key facts,
                      identify parties, dates, and legal issues with precision.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        Fact Extraction
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        Issue Identification
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        Party Detection
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Researcher */}
              <div
                onClick={() => setActiveTool('research')}
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Legal Researcher
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Research laws, regulations, and court decisions. Get comprehensive analysis
                      of how legal principles apply to your cases.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                        Case Law
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                        Statutes
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                        Regulations
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Drafter */}
              <div
                onClick={() => setActiveTool('draft')}
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Document Drafter
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Draft contracts, motions, briefs, complaints, and other legal documents
                      with precision and proper legal formatting.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        Contracts
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        Motions
                      </span>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                        Briefs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Reviewer */}
              <div
                onClick={() => setActiveTool('review')}
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Document Reviewer
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Review and edit legal documents for accuracy, completeness, and effectiveness.
                      Get detailed feedback on improvements.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">
                        Legal Review
                      </span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">
                        Grammar Check
                      </span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">
                        Suggestions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Choose GPULaw Attorney Services?
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Precision-Focused</h4>
                  <p className="text-gray-600">
                    Built specifically for legal work where every word matters. Low-temperature AI
                    models ensure accuracy over creativity.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Secure & Confidential</h4>
                  <p className="text-gray-600">
                    All processing is encrypted and secure. Your client information and legal work
                    remain confidential.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Time-Saving</h4>
                  <p className="text-gray-600">
                    Automate routine tasks and get instant insights. Spend more time on strategy
                    and client relationships.
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
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              &copy; 2025 GPULaw Technologies, Inc. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Disclaimer:</strong> These AI tools are designed to assist attorneys in their work.
              All outputs should be reviewed and verified by a licensed attorney before use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
