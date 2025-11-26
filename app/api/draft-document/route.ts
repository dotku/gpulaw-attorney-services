import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, PROMPTS } from '@/lib/openai';
import { formatLegalDocument } from '@/lib/utils';
import type { DocumentDraftRequest, DocumentDraftResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: DocumentDraftRequest = await request.json();
    const {
      documentType,
      purpose,
      parties = [],
      facts = [],
      legalBasis = [],
      jurisdiction = 'United States',
      tone = 'formal',
      additionalInstructions,
    } = body;

    if (!documentType || !purpose) {
      return NextResponse.json(
        { error: 'Document type and purpose are required' },
        { status: 400 }
      );
    }

    // Build drafting request based on document type
    let draftPrompt = `Draft a professional ${documentType} with the following specifications:

**Purpose:** ${purpose}

**Jurisdiction:** ${jurisdiction}

**Tone:** ${tone}

`;

    if (parties.length > 0) {
      draftPrompt += `\n**Parties:**\n`;
      parties.forEach(party => {
        draftPrompt += `- ${party.name} (${party.role})\n`;
      });
    }

    if (facts.length > 0) {
      draftPrompt += `\n**Relevant Facts:**\n`;
      facts.forEach((fact, index) => {
        draftPrompt += `${index + 1}. ${fact}\n`;
      });
    }

    if (legalBasis.length > 0) {
      draftPrompt += `\n**Legal Basis:**\n`;
      legalBasis.forEach((basis, index) => {
        draftPrompt += `${index + 1}. ${basis}\n`;
      });
    }

    if (additionalInstructions) {
      draftPrompt += `\n**Additional Instructions:**\n${additionalInstructions}\n`;
    }

    // Add document-specific requirements
    switch (documentType) {
      case 'contract':
        draftPrompt += `\n
Draft a legally binding contract that includes:
1. Title and identification of parties
2. Recitals (background and purpose)
3. Definitions section
4. Main terms and conditions
5. Obligations of each party
6. Payment terms (if applicable)
7. Term and termination provisions
8. Representations and warranties
9. Indemnification clauses
10. Dispute resolution provisions
11. General provisions (governing law, severability, entire agreement, etc.)
12. Signature blocks

Ensure all terms are clear, unambiguous, and legally enforceable.`;
        break;

      case 'motion':
        draftPrompt += `\n
Draft a legal motion that includes:
1. Caption (court, case name, case number)
2. Title of motion
3. Introduction
4. Statement of facts
5. Legal argument with citations
6. Prayer for relief
7. Certificate of service
8. Signature block

Use persuasive legal writing and proper citations.`;
        break;

      case 'brief':
        draftPrompt += `\n
Draft a legal brief that includes:
1. Table of contents
2. Table of authorities
3. Statement of the case
4. Statement of facts
5. Summary of argument
6. Argument section with headings and subheadings
7. Conclusion
8. Certificate of service
9. Signature block

Use persuasive legal reasoning with proper citations to support all arguments.`;
        break;

      case 'complaint':
        draftPrompt += `\n
Draft a legal complaint that includes:
1. Caption (court, parties, case information)
2. Jurisdictional statement
3. Parties section (identify all parties)
4. Statement of facts (numbered paragraphs)
5. Causes of action (separately stated)
6. Prayer for relief
7. Demand for jury trial (if applicable)
8. Date and signature block

Use factual allegations that support each element of the causes of action.`;
        break;

      case 'letter':
        draftPrompt += `\n
Draft a professional legal letter that includes:
1. Date
2. Recipient information
3. Subject line
4. Salutation
5. Opening paragraph (purpose)
6. Body paragraphs (explanation and details)
7. Call to action or next steps
8. Professional closing
9. Signature block

Maintain ${tone} tone throughout.`;
        break;

      case 'settlement':
        draftPrompt += `\n
Draft a settlement agreement that includes:
1. Title and parties
2. Recitals
3. Settlement amount and payment terms
4. Release of claims
5. Confidentiality provisions
6. Representations and warranties
7. General provisions
8. Signature blocks

Ensure all settlement terms are clear and enforceable.`;
        break;

      case 'opinion':
        draftPrompt += `\n
Draft a legal opinion that includes:
1. Date and addressee
2. Subject matter
3. Executive summary
4. Facts analyzed
5. Legal analysis
6. Conclusions and recommendations
7. Limitations and assumptions
8. Signature

Provide clear, well-reasoned legal analysis.`;
        break;
    }

    draftPrompt += `\n
**CRITICAL REQUIREMENTS:**
- Use precise legal terminology
- Include all necessary legal elements
- Ensure no ambiguity in key terms
- Follow standard legal formatting
- Include placeholder text in [BRACKETS] for information to be filled in
- Add footnotes or comments for attorney review where appropriate
- Cite relevant legal authority where needed

Provide the complete document formatted professionally.`;

    // Call OpenAI for drafting
    const draftedDocument = await callOpenAI(
      PROMPTS.documentDrafting,
      draftPrompt,
      {
        temperature: 0.4, // Slightly higher for creativity, but still precise
        maxTokens: 4000,
      }
    );

    // Format the document
    const formattedDocument = formatLegalDocument(draftedDocument);

    // Extract sections (simple parsing - could be enhanced)
    const sections = extractSections(formattedDocument);

    // Generate suggestions
    const suggestionsPrompt = `Review this drafted ${documentType} and provide 3-5 specific suggestions for improvement or items the attorney should verify:

${formattedDocument.substring(0, 2000)}...

Return ONLY a JSON array of suggestion strings.`;

    const suggestionsResponse = await callOpenAI(
      'You are a legal editor providing constructive feedback.',
      suggestionsPrompt,
      {
        temperature: 0.5,
        maxTokens: 500,
      }
    );

    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(suggestionsResponse);
      if (Array.isArray(parsed)) {
        suggestions = parsed;
      }
    } catch {
      suggestions = [
        'Review all party names and ensure they match exactly',
        'Verify jurisdictional statements are accurate',
        'Confirm all dates and deadlines',
        'Review monetary amounts and calculations',
        'Ensure all cross-references are correct',
      ];
    }

    const response: DocumentDraftResponse = {
      document: formattedDocument,
      sections,
      suggestions,
      citations: [], // Could extract citations here
      warnings: [
        'This is a draft document that requires attorney review',
        'Verify all factual assertions',
        'Fill in all placeholder information marked with [BRACKETS]',
        'Ensure compliance with local court rules and requirements',
      ],
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Document drafting error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while drafting the document',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function extractSections(document: string): { title: string; content: string; annotations?: string[] }[] {
  const sections: { title: string; content: string; annotations?: string[] }[] = [];
  const lines = document.split('\n');

  let currentSection = { title: 'Introduction', content: '', annotations: [] };

  lines.forEach(line => {
    const trimmed = line.trim();

    // Detect section headers (simplified)
    if (
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      /^[A-Z][A-Z\s]+$/.test(trimmed) ||
      /^\d+\.\s+[A-Z]/.test(trimmed) ||
      /^[IVX]+\.\s+/.test(trimmed)
    ) {
      // Save previous section
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      // Start new section
      currentSection = { title: trimmed, content: '', annotations: [] };
    } else {
      currentSection.content += line + '\n';
    }
  });

  // Add last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
