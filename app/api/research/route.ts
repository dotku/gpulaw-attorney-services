import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/lib/openai';
import type { LegalResearchRequest, LegalResearchResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LegalResearchRequest = await request.json();
    const {
      query,
      jurisdiction = 'United States',
      practiceArea,
      searchType = 'all',
      includeAnalysis = true,
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Research query is required' },
        { status: 400 }
      );
    }

    // Build research request
    const researchPrompt = `Conduct legal research on the following:

**Query:** ${query}
**Jurisdiction:** ${jurisdiction}
${practiceArea ? `**Practice Area:** ${practiceArea}` : ''}
**Search Type:** ${searchType === 'all' ? 'Case law, statutes, and regulations' : searchType}

Provide comprehensive legal research including:

## Relevant Legal Authority

For each relevant authority, provide:
- **Type:** (Case law, Statute, or Regulation)
- **Citation:** Full legal citation
- **Summary:** Brief summary of the authority
- **Key Points:** Main legal principles or holdings
- **Relevance:** How this applies to the query (1-10 scale)
- **Current Status:** Whether this is current law

## Legal Analysis

Provide analysis of how the law applies to this query:
- Primary legal principles
- Key precedents
- Jurisdiction-specific considerations
- Potential arguments
- Counterarguments to consider

## Related Research Queries

Suggest 3-5 related research queries that might be helpful.

${includeAnalysis ? `
## Practical Application

Explain how an attorney should apply this research:
- Next steps
- Arguments to make
- Evidence needed
- Potential challenges
` : ''}

Format your response in clear sections using markdown. Be precise with citations and legal terminology.`;

    // Call OpenAI for research
    const aiResearch = await callOpenAI(
      PROMPTS.legalResearch,
      researchPrompt,
      {
        temperature: 0.2, // Very low temperature for accuracy in legal research
        maxTokens: 4000,
      }
    );

    // Generate related queries
    const relatedQueriesPrompt = `Based on this legal research query: "${query}"

Generate 5 specific, relevant follow-up research queries that an attorney might need to explore.

Return ONLY a JSON array of strings. Example: ["Query 1", "Query 2", "Query 3", "Query 4", "Query 5"]`;

    const relatedQueriesResponse = await callOpenAI(
      'You are a legal research assistant. Generate relevant follow-up research queries.',
      relatedQueriesPrompt,
      {
        temperature: 0.4,
        maxTokens: 300,
      }
    );

    let relatedQueries: string[] = [];
    try {
      const parsed = JSON.parse(relatedQueriesResponse);
      if (Array.isArray(parsed)) {
        relatedQueries = parsed;
      }
    } catch {
      relatedQueries = [
        `${query} - case law`,
        `${query} - statutes`,
        `${query} - recent developments`,
        `${query} - ${jurisdiction}`,
        `${query} - defenses`,
      ];
    }

    // Structure the response
    // In a real implementation, you would parse the AI response to extract structured data
    const response: LegalResearchResponse = {
      query,
      results: [
        {
          type: 'analysis',
          title: 'Legal Research Analysis',
          summary: aiResearch,
          relevance: 10,
          fullText: aiResearch,
        },
      ],
      analysis: includeAnalysis ? aiResearch : undefined,
      relatedQueries,
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Legal research error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while conducting research',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
