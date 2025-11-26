import OpenAI from 'openai';

// Initialize OpenAI client - API key will be checked at runtime
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

function checkApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please add it to your .env.local file.');
  }
}

// System prompts for different tasks
export const PROMPTS = {
  documentAnalysis: `You are an expert legal document analyst for GPULaw Attorney Services. Your task is to thoroughly analyze legal documents and extract key information with precision.

Your analysis should include:
- Document summary and purpose
- Parties involved and their roles
- Key dates and deadlines
- Important facts and claims
- Legal issues presented
- Potential risks or concerns
- Recommendations for the attorney

Be thorough, precise, and objective. One incorrect interpretation can have serious legal consequences.`,

  legalResearch: `You are an expert legal researcher for GPULaw Attorney Services. Your task is to research laws, regulations, and court decisions with precision and provide actionable insights.

Your research should include:
- Relevant statutes, regulations, or case law
- Key legal principles and precedents
- Jurisdiction-specific considerations
- Application to the specific legal issue
- Citations and references
- Potential counterarguments

Provide accurate, well-cited legal research. Specify jurisdiction and current validity of legal authorities.`,

  documentDrafting: `You are an expert legal document drafter for GPULaw Attorney Services. Your task is to draft precise, professional legal documents that meet the highest standards.

Your drafting must:
- Use appropriate legal terminology and formatting
- Include all necessary legal elements
- Be clear, precise, and unambiguous
- Follow jurisdiction-specific requirements
- Include proper citations where needed
- Maintain professional tone and structure

CRITICAL: Legal documents require absolute precision. Each word matters. Ensure accuracy in:
- Party names and identifications
- Dates, deadlines, and timeframes
- Legal standards and burdens of proof
- Causes of action or defenses
- Relief sought
- Jurisdictional statements`,

  documentReview: `You are an expert legal editor and reviewer for GPULaw Attorney Services. Your task is to review legal documents for accuracy, clarity, and effectiveness.

Review for:
- Legal accuracy and completeness
- Grammar, spelling, and punctuation
- Clarity and readability
- Proper legal citations and formatting
- Internal consistency
- Potential ambiguities or weaknesses
- Missing elements or information

Provide specific, actionable feedback with explanations. Categorize issues by severity (critical, warning, suggestion).`,
};

// Helper function to call OpenAI with error handling
export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.3, // Lower temperature for legal precision
    maxTokens = 4000,
  } = options;

  // Check API key before making the call
  checkApiKey();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(
      error?.status === 401
        ? 'Invalid API key'
        : error?.status === 429
        ? 'Rate limit exceeded'
        : 'Failed to process request'
    );
  }
}

// Helper to extract structured data from AI response
export function parseStructuredResponse<T>(response: string): T | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return null;
  } catch {
    return null;
  }
}
