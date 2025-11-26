import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/lib/openai';
import { sanitizeInput, extractDates, extractParties, extractCitations, analyzeDocumentStructure } from '@/lib/utils';
import type { DocumentAnalysisRequest, DocumentAnalysisResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: DocumentAnalysisRequest = await request.json();
    const { content, documentType = 'other', analysisType = 'full', context } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);

    // Extract basic information
    const dates = extractDates(sanitizedContent);
    const parties = extractParties(sanitizedContent);
    const citations = extractCitations(sanitizedContent);
    const structure = analyzeDocumentStructure(sanitizedContent);

    // Build analysis request based on type
    let analysisPrompt = '';

    switch (analysisType) {
      case 'summary':
        analysisPrompt = `Please provide a concise summary of this ${documentType}:

${sanitizedContent}

Provide:
1. Main purpose of the document
2. Key points (3-5 bullet points)
3. Important deadlines or dates
4. Critical terms or conditions`;
        break;

      case 'issues':
        analysisPrompt = `Analyze this ${documentType} and identify legal issues:

${sanitizedContent}

Identify:
1. Primary legal issues
2. Potential problems or concerns
3. Missing information
4. Risks or liabilities`;
        break;

      case 'extract_facts':
        analysisPrompt = `Extract key facts from this ${documentType}:

${sanitizedContent}

Extract:
1. All relevant facts in chronological order
2. Parties and their roles
3. Dates and events
4. Locations mentioned
5. Actions taken`;
        break;

      case 'full':
      default:
        analysisPrompt = `Conduct a comprehensive legal analysis of this ${documentType}:

${sanitizedContent}

${context ? `Additional Context: ${context}\n` : ''}

Provide a thorough analysis including:

## Summary
Brief overview of the document and its purpose

## Parties Involved
List all parties and their roles

## Key Facts
Chronological list of important facts

## Legal Issues
Primary legal issues presented

## Critical Dates & Deadlines
All important dates and their significance

## Key Terms & Provisions
Important contractual terms, obligations, or legal provisions

## Risks & Concerns
Potential legal risks, ambiguities, or red flags

## Recommendations
Specific actions or next steps for the attorney

Format your response in clear sections using markdown.`;
        break;
    }

    // Call OpenAI for analysis
    const aiAnalysis = await callOpenAI(
      PROMPTS.documentAnalysis,
      analysisPrompt,
      {
        temperature: 0.3, // Low temperature for accuracy
        maxTokens: 4000,
      }
    );

    // Structure the response
    const response: DocumentAnalysisResponse = {
      summary: aiAnalysis,
      keyIssues: [],
      legalAnalysis: aiAnalysis,
      facts: [],
      recommendations: [],
      parties: parties.map(name => ({ name, role: 'Unknown' })),
      dates: dates.map(d => ({ date: d.date, event: d.context })),
      extractedData: {
        citations,
        structure,
        wordCount: structure.wordCount,
        documentType,
      },
      confidence: 0.85, // This could be calculated based on various factors
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Document analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while analyzing the document',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
