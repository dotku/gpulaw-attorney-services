/**
 * Utility functions for document processing
 */

export function extractDates(text: string): { date: string; context: string }[] {
  const dates: { date: string; context: string }[] = [];

  // Common date patterns
  const patterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, // MM/DD/YYYY
    /\b(\d{1,2}-\d{1,2}-\d{2,4})\b/g,   // MM-DD-YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const startPos = Math.max(0, match.index - 50);
      const endPos = Math.min(text.length, match.index + match[0].length + 50);
      const context = text.substring(startPos, endPos);

      dates.push({
        date: match[0],
        context: context.trim(),
      });
    }
  });

  return dates;
}

export function extractParties(text: string): string[] {
  const parties: Set<string> = new Set();

  // Look for common legal party designations
  const patterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\((?:Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee)\)/g,
    /\b(?:Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      parties.add(match[1].trim());
    }
  });

  return Array.from(parties);
}

export function extractCitations(text: string): string[] {
  const citations: Set<string> = new Set();

  // Common legal citation patterns
  const patterns = [
    /\b\d+\s+[A-Z][a-z\.]+\s+\d+(?:,\s+\d+)?\s+\(\d{4}\)/g, // Case citations
    /\b\d+\s+U\.S\.C\.\s+§?\s*\d+/g, // U.S. Code
    /\b\d+\s+C\.F\.R\.\s+§?\s*\d+/g, // Code of Federal Regulations
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      citations.add(match[0]);
    }
  });

  return Array.from(citations);
}

export function analyzeDocumentStructure(text: string) {
  const lines = text.split('\n');
  const structure = {
    paragraphs: 0,
    sections: 0,
    wordCount: 0,
    hasNumbering: false,
    hasSignature: false,
  };

  let currentParagraph = '';

  lines.forEach(line => {
    const trimmed = line.trim();

    // Count sections (lines that might be headers)
    if (trimmed.length > 0 && trimmed.length < 100 && /^[A-Z]/.test(trimmed)) {
      if (!trimmed.endsWith('.') && !trimmed.includes(',')) {
        structure.sections++;
      }
    }

    // Check for numbering
    if (/^\d+\.|^[A-Z]\.|^\([a-z]\)|^\([0-9]\)/.test(trimmed)) {
      structure.hasNumbering = true;
    }

    // Check for signature
    if (/signature|signed|executed/i.test(trimmed)) {
      structure.hasSignature = true;
    }

    // Count words
    structure.wordCount += trimmed.split(/\s+/).filter(w => w.length > 0).length;

    // Count paragraphs
    if (trimmed.length > 0) {
      currentParagraph += ' ' + trimmed;
    } else if (currentParagraph.length > 0) {
      structure.paragraphs++;
      currentParagraph = '';
    }
  });

  if (currentParagraph.length > 0) {
    structure.paragraphs++;
  }

  return structure;
}

export function sanitizeInput(input: string): string {
  // Remove potentially harmful content while preserving legal text
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .trim();
}

export function formatLegalDocument(content: string): string {
  // Basic formatting for legal documents
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
}
