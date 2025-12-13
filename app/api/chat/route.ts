import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { sanitizeInput } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages = [],
      context,
      toolType = 'general',
    } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    const sanitizedUserMessage = sanitizeInput(lastMessage.content);

    // Build context-aware system prompt based on tool type
    let systemPrompt = `You are a highly knowledgeable legal AI assistant specialized in helping attorneys with their work. You have expertise in:

- Legal document analysis and interpretation
- Legal research and case law
- Document drafting and review
- Legal reasoning and argumentation
- Contract analysis and interpretation
- Regulatory compliance

**Current Tool Context:** ${getToolDescription(toolType)}

**Important Guidelines:**
1. Provide accurate, precise legal information
2. Be concise but thorough in your responses
3. Cite relevant legal principles when applicable
4. Always remind users that AI assistance should be reviewed by a licensed attorney
5. If you're uncertain, acknowledge it clearly
6. Focus on practical, actionable guidance

**Tone:** Professional, precise, and helpful`;

    // Add document context if provided
    let contextPrompt = '';
    if (context) {
      const sanitizedContext = sanitizeInput(context).substring(0, 3000);
      contextPrompt = `\n\n**Document Context (for reference):**\n${sanitizedContext}\n`;
    }

    // Build conversation history
    const conversationHistory = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role,
      content: sanitizeInput(msg.content),
    }));

    // Create the full prompt
    const fullPrompt = `${contextPrompt}

**User Question:**
${sanitizedUserMessage}

Please provide a helpful, accurate response based on the context and your legal expertise.`;

    // Call OpenAI
    const response = await callOpenAI(
      systemPrompt,
      fullPrompt,
      {
        temperature: 0.4, // Balanced between creativity and precision
        maxTokens: 1500,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        message: response.trim(),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Chat error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during chat',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function getToolDescription(toolType: string): string {
  const descriptions: Record<string, string> = {
    analyzer: 'Document Analyzer - Analyzing legal documents to extract facts, identify issues, and detect key information',
    researcher: 'Legal Researcher - Conducting legal research on laws, regulations, and case law',
    drafter: 'Document Drafter - Drafting legal documents including contracts, motions, briefs, and other legal writings',
    reviewer: 'Document Reviewer - Reviewing and editing legal documents for accuracy, completeness, and effectiveness',
    general: 'General Legal Assistant',
  };

  return descriptions[toolType] || descriptions.general;
}
