// Document Types
export interface DocumentAnalysisRequest {
  content: string;
  documentType?: 'contract' | 'email' | 'evidence' | 'motion' | 'brief' | 'complaint' | 'other';
  analysisType?: 'summary' | 'issues' | 'full' | 'extract_facts' | 'legal_analysis';
  context?: string;
}

export interface DocumentAnalysisResponse {
  summary?: string;
  keyIssues?: string[];
  legalAnalysis?: string;
  facts?: string[];
  recommendations?: string[];
  parties?: { name: string; role: string }[];
  dates?: { date: string; event: string }[];
  extractedData?: Record<string, any>;
  confidence?: number;
}

// Research Types
export interface LegalResearchRequest {
  query: string;
  jurisdiction?: string;
  practiceArea?: string;
  searchType?: 'case_law' | 'statutes' | 'regulations' | 'all';
  includeAnalysis?: boolean;
}

export interface LegalResearchResponse {
  query: string;
  results: {
    type: 'case_law' | 'statute' | 'regulation' | 'analysis';
    title: string;
    citation?: string;
    summary: string;
    relevance: number;
    keyPoints?: string[];
    fullText?: string;
  }[];
  analysis?: string;
  relatedQueries?: string[];
}

// Document Drafting Types
export interface DocumentDraftRequest {
  documentType: 'contract' | 'letter' | 'motion' | 'brief' | 'settlement' | 'complaint' | 'opinion';
  purpose: string;
  parties?: { name: string; role: string }[];
  facts?: string[];
  legalBasis?: string[];
  jurisdiction?: string;
  tone?: 'formal' | 'professional' | 'persuasive' | 'neutral';
  additionalInstructions?: string;
}

export interface DocumentDraftResponse {
  document: string;
  sections: {
    title: string;
    content: string;
    annotations?: string[];
  }[];
  suggestions?: string[];
  citations?: string[];
  warnings?: string[];
}

// Document Review Types
export interface DocumentReviewRequest {
  content: string;
  documentType?: string;
  reviewType?: 'grammar' | 'legal' | 'comprehensive' | 'fact_check';
  jurisdiction?: string;
  specificConcerns?: string[];
}

export interface DocumentReviewResponse {
  originalContent: string;
  issues: {
    type: 'grammar' | 'legal' | 'factual' | 'style' | 'citation' | 'formatting';
    severity: 'critical' | 'warning' | 'suggestion';
    location: string;
    issue: string;
    suggestion: string;
    explanation?: string;
  }[];
  revisedDocument?: string;
  overallAssessment: string;
  strengthScore?: number;
  suggestions?: string[];
}

// Analysis Result Types
export interface AnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}
