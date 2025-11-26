import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/lib/openai';
import { sanitizeInput } from '@/lib/utils';
import type { DocumentReviewRequest, DocumentReviewResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: DocumentReviewRequest = await request.json();
    const {
      content,
      documentType = 'legal document',
      reviewType = 'comprehensive',
      jurisdiction,
      specificConcerns = [],
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitizeInput(content);

    // Build review request
    let reviewPrompt = `Review this ${documentType} with ${reviewType} analysis:

${sanitizedContent}

${jurisdiction ? `**Jurisdiction:** ${jurisdiction}\n` : ''}

${specificConcerns.length > 0 ? `**Specific Concerns to Address:**\n${specificConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n` : ''}

Conduct a thorough review and identify issues in the following categories:

## Legal Issues
- Missing legal elements
- Incorrect legal standards
- Improper citations
- Jurisdictional problems
- Statute of limitations concerns
- Standing or capacity issues

## Factual Issues
- Inconsistent facts
- Missing crucial facts
- Unsupported allegations
- Timeline problems

## Drafting Issues
- Ambiguous language
- Contradictory provisions
- Vague terms that should be defined
- Overly complex sentences
- Missing or incorrect cross-references

## Grammar and Style
- Grammatical errors
- Spelling mistakes
- Punctuation errors
- Improper legal writing style
- Tone inconsistencies

## Formatting Issues
- Improper citation format
- Numbering errors
- Structural problems
- Missing sections

For each issue identified, provide:
1. **Type:** (legal, factual, drafting, grammar, formatting)
2. **Severity:** (critical, warning, suggestion)
3. **Location:** Where in the document (quote the relevant text)
4. **Issue:** Clear description of the problem
5. **Suggestion:** Specific recommendation for fixing it
6. **Explanation:** Why this matters

Return your analysis in the following JSON format:
\`\`\`json
{
  "issues": [
    {
      "type": "legal|factual|drafting|grammar|formatting",
      "severity": "critical|warning|suggestion",
      "location": "exact quote from document",
      "issue": "description of problem",
      "suggestion": "how to fix it",
      "explanation": "why it matters"
    }
  ],
  "overallAssessment": "summary of document quality",
  "strengthScore": 0-100,
  "suggestions": ["general suggestion 1", "general suggestion 2"]
}
\`\`\`

Be thorough and precise. Legal documents require perfection.`;

    // Call OpenAI for review
    const reviewResponse = await callOpenAI(
      PROMPTS.documentReview,
      reviewPrompt,
      {
        temperature: 0.2, // Low temperature for precise review
        maxTokens: 4000,
      }
    );

    // Parse the JSON response
    let parsedReview: any = null;
    try {
      const jsonMatch = reviewResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedReview = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse review response:', parseError);
    }

    // If parsing failed, create a basic structure
    if (!parsedReview) {
      parsedReview = {
        issues: [],
        overallAssessment: reviewResponse,
        strengthScore: 70,
        suggestions: [
          'Review all legal citations for accuracy',
          'Verify all party names are consistent',
          'Check all dates and deadlines',
        ],
      };
    }

    // Generate revised document if comprehensive review
    let revisedDocument: string | undefined;
    if (reviewType === 'comprehensive' && parsedReview.issues.length > 0) {
      const revisionPrompt = `Based on the following issues identified in the document, provide a revised version:

**Original Document:**
${sanitizedContent.substring(0, 3000)}

**Issues to Address:**
${parsedReview.issues.slice(0, 10).map((issue: any, i: number) =>
  `${i + 1}. [${issue.severity}] ${issue.issue} - ${issue.suggestion}`
).join('\n')}

Provide the complete revised document with all issues addressed. Maintain the original structure and format, but fix the identified problems.`;

      try {
        revisedDocument = await callOpenAI(
          'You are a legal editor. Revise the document to address all identified issues.',
          revisionPrompt,
          {
            temperature: 0.3,
            maxTokens: 4000,
          }
        );
      } catch (error) {
        console.error('Failed to generate revised document:', error);
      }
    }

    const response: DocumentReviewResponse = {
      originalContent: sanitizedContent,
      issues: parsedReview.issues || [],
      revisedDocument,
      overallAssessment: parsedReview.overallAssessment || 'Review completed',
      strengthScore: parsedReview.strengthScore || 70,
      suggestions: parsedReview.suggestions || [],
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Document review error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while reviewing the document',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
