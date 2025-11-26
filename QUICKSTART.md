# Quick Start Guide

## Setup in 3 Minutes

### 1. Install Dependencies (if not already done)

```bash
cd gpulaw-attorney-services
npm install
```

### 2. Configure Your OpenAI API Key

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Don't have an OpenAI API key?**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and paste it in `.env.local`

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You Can Do

### 1. Document Analyzer
- Click "Document Analyzer"
- Paste any legal document (contract, email, motion, etc.)
- Select document type and analysis type
- Click "Analyze Document"
- Get comprehensive analysis with extracted facts, dates, parties, and legal issues

**Try it with:**
- Client emails
- Contracts you're reviewing
- Evidence documents
- Court filings

### 2. Legal Researcher
- Click "Legal Researcher"
- Enter your legal question (e.g., "statute of limitations for personal injury in California")
- Specify jurisdiction and practice area
- Click "Conduct Research"
- Get comprehensive legal research with citations and analysis

**Example queries:**
- "Elements of breach of contract claim"
- "Landlord obligations for security deposits in New York"
- "Requirements for will execution in Texas"

### 3. Document Drafter
- Click "Document Drafter"
- Select document type (contract, letter, motion, etc.)
- Describe the purpose
- Add parties and relevant facts
- Click "Draft Document"
- Get a professionally formatted legal document

**Try drafting:**
- Service agreements
- Demand letters
- Simple motions
- Settlement agreements

### 4. Document Reviewer
- Click "Document Reviewer"
- Paste your document
- Select review type (comprehensive, legal only, grammar only)
- Click "Review Document"
- Get detailed feedback on issues with severity ratings
- See revised version (for comprehensive reviews)

**Use it to review:**
- Contracts before signing
- Motions before filing
- Client correspondence
- Settlement offers

## Tips for Best Results

### For Document Analysis
- Provide complete documents when possible
- Include context if analyzing a portion of a larger document
- Use specific document types for better categorization

### For Legal Research
- Be specific with your queries
- Include jurisdiction for more accurate results
- Use related queries to explore connected topics

### For Document Drafting
- Provide detailed facts and context
- List all parties with their roles
- Specify jurisdiction for jurisdiction-specific language
- Review and customize the output - it's a starting point!

### For Document Review
- Use comprehensive review for first drafts
- Use legal review for final checks
- Pay special attention to "critical" severity issues
- Compare original with revised version

## Common Use Cases

### New Case Intake
1. Use **Document Analyzer** to review client emails and initial documents
2. Use **Legal Researcher** to research relevant laws
3. Use **Document Drafter** to create initial demand letters or responses

### Contract Review
1. Use **Document Analyzer** to extract key terms and parties
2. Use **Document Reviewer** to identify issues
3. Use **Legal Researcher** to verify specific clauses

### Motion Practice
1. Use **Legal Researcher** to find supporting case law
2. Use **Document Drafter** to create initial draft
3. Use **Document Reviewer** to polish the final version

### Client Communication
1. Use **Document Drafter** for professional letters
2. Use **Document Reviewer** to ensure clarity and accuracy

## Keyboard Shortcuts

- **Back to Tools**: Click the back button or browser back
- **Copy Results**: Use the copy buttons to quickly copy generated text

## Troubleshooting

### "Invalid API key" error
- Check that you've added your OpenAI API key to `.env.local`
- Make sure there are no spaces or quotes around the key
- Restart the dev server after adding the key

### Slow responses
- OpenAI API responses can take 5-30 seconds depending on complexity
- Larger documents take longer to process
- Check your internet connection

### Rate limit errors
- OpenAI has rate limits on API usage
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan for higher limits

## Need Help?

- Read the full [README.md](README.md) for detailed documentation
- Check API documentation for integration details
- Contact support@gpulaw.com for assistance

## Next Steps

- Integrate with your existing workflow
- Customize prompts for your practice area (see `lib/openai.ts`)
- Set up user authentication for your team
- Deploy to production (use `npm run build`)

---

**Remember**: All AI outputs should be reviewed by a licensed attorney before use. This tool is designed to assist, not replace, professional legal judgment.
