import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, checkRateLimit } from '@/lib/api-auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if ('error' in auth && auth.error) return auth.error;

  const rateLimited = await checkRateLimit(auth.user.sub, 10, 60_000);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { documentType, jurisdiction, clientName, userPrompt, additionalContext, language } = body;

    if (!userPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const languageInstruction = language === 'zh-TW'
      ? 'Please write the document in Traditional Chinese (繁體中文).'
      : language === 'zh-CN'
        ? 'Please write the document in Simplified Chinese (简体中文).'
        : 'Please write the document in English.';

    const systemPrompt = `You are an expert legal document drafting assistant. Generate professional legal documents based on the user's requirements.

Format the output as clean Markdown with proper headings, sections, and formatting.

${languageInstruction}

Document type: ${documentType || 'General'}
${jurisdiction ? `Jurisdiction: ${jurisdiction}` : ''}
${clientName ? `Client: ${clientName}` : ''}

Important:
- Use proper legal language and formatting
- Include appropriate disclaimers
- Structure the document with clear sections
- Be thorough and professional`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${userPrompt}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Document generation error:', error);

    // Fallback demo content if API fails
    const fallbackContent = `# Generated Legal Document\n\nThis is a placeholder document. The AI generation service is currently unavailable.\n\nPlease configure your OpenAI API key in the environment variables to enable AI document generation.\n\n---\n\n*Document generation requires a valid API key.*`;

    return NextResponse.json({ content: fallbackContent });
  }
}
