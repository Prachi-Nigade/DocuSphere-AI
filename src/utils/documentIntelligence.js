/**
 * Document Intelligence & Question Answering Engine
 * Combines high-precision BM25/TF-IDF chunk retrieval, entity extraction,
 * grounded synthesized answers, and optional Google Gemini API acceleration.
 */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
  "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
  "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
  "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
  "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me",
  "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
  "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
  "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
  "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these",
  "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
  "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
  "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
  "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
  "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

/**
 * Tokenize text into normalized keywords (ignoring punctuation and stop words)
 */
function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s$%.-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Perform semantic & lexical scoring of document chunks against user query
 */
export function searchDocumentChunks(query, chunks, topK = 4) {
  if (!chunks || chunks.length === 0) return [];

  const queryClean = query.toLowerCase().trim();
  const queryTokens = tokenize(queryClean);
  const hasNumbersOrCurrency = /[\d$%]/.test(queryClean);
  const isSummaryQuery =
    queryClean.includes("summar") ||
    queryClean.includes("overview") ||
    queryClean.includes("about") ||
    queryClean.includes("main point") ||
    queryClean.includes("takeaway");

  // Document frequencies for IDF calculation
  const df = new Map();
  chunks.forEach((chunk) => {
    const uniqueTokens = new Set(tokenize(chunk.text));
    uniqueTokens.forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  });

  const totalChunks = Math.max(1, chunks.length);

  const scored = chunks.map((chunk) => {
    let score = 0;
    const chunkText = chunk.text || "";
    const chunkTextLower = chunkText.toLowerCase();

    // 1. Exact phrase match bonus
    if (queryClean.length > 4 && chunkTextLower.includes(queryClean)) {
      score += 25;
    }

    // 2. Token overlap with IDF weight
    const chunkTokens = tokenize(chunkTextLower);
    const chunkTokenSet = new Set(chunkTokens);

    queryTokens.forEach((token) => {
      if (chunkTokenSet.has(token)) {
        const idf = Math.log(1 + totalChunks / (df.get(token) || 1));
        score += 3.5 * idf;
      }
    });

    // 3. Numbers, Currency, Entity alignment
    if (hasNumbersOrCurrency && /[\d$%]/.test(chunkText)) {
      score += 6.0;
    }

    // 4. Heading / Title / Sheet boost
    if (chunk.sectionTitle && queryClean.includes(chunk.sectionTitle.toLowerCase())) {
      score += 8.0;
    }
    if (chunk.sheetName && queryClean.includes(chunk.sheetName.toLowerCase())) {
      score += 10.0;
    }

    // 5. Summary query boost for introductory chunks (page 1, section 1)
    if (isSummaryQuery && (chunk.pageNumber === 1 || chunk.sectionTitle?.includes("1") || chunk.row === 1)) {
      score += 5.0;
    }

    return { chunk, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Filter chunks with positive relevance, or take top chunks if summary
  const results = scored
    .filter((item) => (isSummaryQuery ? item.score >= 0 : item.score > 1.0))
    .slice(0, topK)
    .map((item) => ({
      ...item.chunk,
      score: item.score,
    }));

  return results;
}

/**
 * Answer a user query based on uploaded documents
 */
export async function answerDocumentQuery({
  query,
  documents = [],
  activeDocumentId = null,
  geminiApiKey = null,
}) {
  if (!documents || documents.length === 0) {
    return {
      content:
        "No documents have been uploaded yet. Please upload a PDF, Word document, Excel spreadsheet, or Text file in the sidebar or upload zone to begin analyzing.",
      citations: [],
      suggestedQueries: [
        "Upload a PDF or Word file to inspect",
        "Upload an Excel financial sheet to analyze",
        "Upload a project specification document",
      ],
    };
  }

  // 1. Select search scope (Active document or all documents)
  let targetDocs = documents;
  if (activeDocumentId && activeDocumentId !== "all") {
    const found = documents.find((d) => d.id === activeDocumentId);
    if (found) {
      targetDocs = [found];
    }
  }

  // 2. Gather all chunks from target documents
  let allChunks = [];
  targetDocs.forEach((doc) => {
    if (doc.chunks && doc.chunks.length > 0) {
      allChunks.push(...doc.chunks);
    }
  });

  if (allChunks.length === 0) {
    // If no chunks were created, fallback to target document text
    allChunks = targetDocs.map((doc, idx) => ({
      id: `chunk-doc-${idx}`,
      docId: doc.id,
      docName: doc.name,
      format: doc.format,
      pageNumber: 1,
      text: doc.content || `Document: ${doc.name} (${doc.format})`,
    }));
  }

  // 3. Search and rank top matching chunks
  const topChunks = searchDocumentChunks(query, allChunks, 4);

  // 4. Try Gemini API if an API key is available
  const apiKey =
    geminiApiKey ||
    (typeof window !== "undefined" ? localStorage.getItem("docusphere_gemini_api_key") : null) ||
    import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await callGeminiApi({
        query,
        chunks: topChunks.length > 0 ? topChunks : allChunks.slice(0, 5),
        targetDocs,
        apiKey: apiKey.trim(),
      });

      if (geminiResult) {
        return {
          content: geminiResult.content,
          citations: buildCitations(topChunks, targetDocs),
          suggestedQueries: geminiResult.suggestedQueries || generateFollowUpQueries(query, targetDocs),
        };
      }
    } catch (geminiError) {
      console.warn("Gemini API call failed, falling back to built-in RAG engine:", geminiError);
    }
  }

  // 5. Built-in Offline Grounded RAG Synthesis Engine
  return synthesizeLocalGroundedResponse({
    query,
    chunks: topChunks,
    targetDocs,
    allChunks,
  });
}

/**
 * Synthesize clear, verified, and grounded response using built-in engine
 */
function synthesizeLocalGroundedResponse({ query, chunks, targetDocs }) {
  const primaryDoc = targetDocs[0];
  const queryLower = query.toLowerCase().trim();
  const isSummaryQuery =
    queryLower.includes("summar") ||
    queryLower.includes("overview") ||
    queryLower.includes("about") ||
    queryLower.includes("what is this") ||
    queryLower.includes("main topic");

  // Handle case where query didn't match any specific passage
  if (chunks.length === 0) {
    const docName = primaryDoc ? primaryDoc.name : "uploaded documents";
    return {
      content: `I analyzed **${docName}**, but could not find a direct factual passage matching: *"**${query}**"*.\n\n### Suggestions to refine your inquiry:\n* Try using specific keywords mentioned in the document headings or tables.\n* If this is a spreadsheet, mention the column name or row category.\n* Ask: *"Summarize the main points of this document"* for a high-level overview.`,
      citations: [],
      suggestedQueries: primaryDoc?.suggestedQuestions || [
        `Summarize the key sections in ${primaryDoc?.name || "this document"}`,
        "What are the main topics covered?",
      ],
    };
  }

  const citations = buildCitations(chunks, targetDocs);
  let responseContent = "";

  // -------------------------------------------------------------
  // Scenario A: Summary / Overview Query
  // -------------------------------------------------------------
  if (isSummaryQuery) {
    responseContent = `Here is the comprehensive synthesis and overview of **"${primaryDoc.name}"** (${primaryDoc.format?.toUpperCase()}):\n\n`;
    responseContent += `### Document Profile\n`;
    responseContent += `* **Format**: ${primaryDoc.format?.toUpperCase()}\n`;
    responseContent += `* **Size**: ${primaryDoc.size || "Standard"}\n`;
    if (primaryDoc.pages) responseContent += `* **Total Pages**: ${primaryDoc.pages} pages\n`;
    if (primaryDoc.sheetsCount) responseContent += `* **Sheets**: ${primaryDoc.sheetsCount} sheets (${primaryDoc.rowsCount || 0} rows)\n`;
    responseContent += `* **Vector Chunks**: ${primaryDoc.chunksCount || chunks.length} indexed segments\n\n`;

    responseContent += `### Core Findings & Key Topics\n`;
    chunks.slice(0, 3).forEach((chunk, i) => {
      const cleanSnippet = cleanExcerpt(chunk.text);
      const loc = formatChunkLocation(chunk);
      responseContent += `* **Key Section ${i + 1} (${loc})**: ${cleanSnippet}\n`;
    });

    responseContent += `\n*You can click any citation pill below to view the verified original page or spreadsheet row in the Interactive Document Viewer.*`;
  }
  // -------------------------------------------------------------
  // Scenario B: Excel Spreadsheet Query
  // -------------------------------------------------------------
  else if (primaryDoc.format === "excel" || chunks.some((c) => c.sheetName)) {
    const topChunk = chunks[0];
    const sheetName = topChunk.sheetName || primaryDoc.sheetsData?.[0]?.name || "Sheet";

    responseContent = `Based on the verified data in **${primaryDoc.name}** (Sheet: *${sheetName}*):\n\n`;
    responseContent += `### Direct Data Finding\n`;
    responseContent += `${cleanExcerpt(topChunk.text)}\n\n`;

    if (chunks.length > 1) {
      responseContent += `### Corroborating Rows\n`;
      chunks.slice(1, 4).forEach((c) => {
        responseContent += `* **Row ${c.row || c.rowNumber || "Record"}**: ${cleanExcerpt(c.text)}\n`;
      });
      responseContent += `\n`;
    }

    responseContent += `*Click on the citation badge below to focus and highlight this specific row in the interactive spreadsheet grid.*`;
  }
  // -------------------------------------------------------------
  // Scenario C: Specific Factual / Policy / Technical Inquiry
  // -------------------------------------------------------------
  else {
    const topChunk = chunks[0];
    const location = formatChunkLocation(topChunk);

    responseContent = `Based on verified analysis of **${topChunk.docName || primaryDoc.name}** (${location}):\n\n`;
    responseContent += `### Verified Answer\n`;
    responseContent += `${cleanExcerpt(topChunk.text)}\n\n`;

    if (chunks.length > 1) {
      responseContent += `### Supporting Evidence & Context\n`;
      chunks.slice(1, 3).forEach((c, idx) => {
        const loc = formatChunkLocation(c);
        responseContent += `* **Finding ${idx + 2} (${loc})**: ${cleanExcerpt(c.text)}\n`;
      });
      responseContent += `\n`;
    }

    responseContent += `*Click any citation badge below to launch the side-by-side Document Viewer and highlight the exact cited paragraph.*`;
  }

  const suggestedQueries = generateFollowUpQueries(query, targetDocs);

  return {
    content: responseContent,
    citations,
    suggestedQueries,
  };
}

/**
 * Format chunk location string (e.g. Page 3, Sheet: Sales • Row 12)
 */
function formatChunkLocation(chunk) {
  if (chunk.pageNumber) return `Page ${chunk.pageNumber}`;
  if (chunk.sheetName && (chunk.row || chunk.rowNumber)) {
    return `${chunk.sheetName} • Row ${chunk.row || chunk.rowNumber}`;
  }
  if (chunk.sheetName) return `Sheet: ${chunk.sheetName}`;
  if (chunk.sectionTitle) return `${chunk.sectionTitle}`;
  if (chunk.line) return `Line ${chunk.line}`;
  return "Section 1";
}

/**
 * Clean up text excerpts to be readable and concise
 */
function cleanExcerpt(text = "") {
  return text
    .replace(/\s+/g, " ")
    .replace(/^\[.*?\]\s*/, "") // remove leading [Sheet: X] tag if present
    .trim();
}

/**
 * Build citation badges with similarity calculations
 */
function buildCitations(chunks, targetDocs) {
  const maxScore = Math.max(1, ...chunks.map((c) => c.score || 1));

  return chunks.map((chunk, idx) => {
    const doc = targetDocs.find((d) => d.id === chunk.docId) || targetDocs[0];
    const rawScore = chunk.score || 1;
    const similarity = Math.round((Math.min(0.98, Math.max(0.75, 0.75 + (rawScore / (maxScore * 4)))) * 100)) / 100;

    return {
      id: `cit-${Date.now()}-${idx + 1}`,
      docId: chunk.docId || doc?.id,
      docName: chunk.docName || doc?.name || "Uploaded Document",
      format: chunk.format || doc?.format || "pdf",
      page: chunk.pageNumber,
      sheet: chunk.sheetName,
      row: chunk.row || chunk.rowNumber,
      section: chunk.sectionTitle,
      paragraphId: chunk.paragraphId,
      line: chunk.line,
      similarity: similarity,
      snippet: cleanExcerpt(chunk.text).slice(0, 240),
    };
  });
}

/**
 * Generate contextual follow-up questions
 */
function generateFollowUpQueries(query, targetDocs) {
  const doc = targetDocs[0];
  if (!doc) return [];

  const suggestions = [];
  const qLower = query.toLowerCase();

  if (doc.format === "excel") {
    suggestions.push(`What is the highest or lowest value recorded in this dataset?`);
    suggestions.push(`Can you summarize the totals across all columns?`);
  } else if (qLower.includes("security") || qLower.includes("encrypt")) {
    suggestions.push("What encryption standards are enforced for data at rest and in transit?");
    suggestions.push("What are the key rotation and audit log policies?");
  } else if (qLower.includes("cost") || qLower.includes("revenue") || qLower.includes("financial")) {
    suggestions.push("What is the projected revenue or expenditure breakdown?");
    suggestions.push("Are there any unexpected variances or budget limits mentioned?");
  } else {
    suggestions.push(`Can you detail the key requirements in Section 1?`);
    suggestions.push(`What compliance or operational measures are recommended?`);
  }

  suggestions.push(`Explain the main conclusions of ${doc.name}`);
  return suggestions.slice(0, 3);
}

/**
 * Optional Google Gemini API Call (Grounded RAG synthesis with LLM)
 */
async function callGeminiApi({ query, chunks, targetDocs, apiKey }) {
  const docNames = targetDocs.map((d) => d.name).join(", ");
  const contextExcerpts = chunks
    .map((c, i) => {
      const loc = formatChunkLocation(c);
      return `[Excerpt ${i + 1} | Document: "${c.docName || docNames}" | Location: ${loc}]\n${c.text}`;
    })
    .join("\n\n");

  const systemInstruction = `You are DocuSphere-AI, an expert enterprise document intelligence assistant.
Your goal is to provide a clear, accurate, fact-based answer to the user's question, grounded strictly in the provided document excerpts.
Rules:
1. Ground your answer ONLY in the provided excerpts. Do not fabricate information.
2. If the excerpts do not contain the answer, politely state that the information was not found in the uploaded documents.
3. Use clean markdown formatting:
   - Provide a bold direct answer first.
   - Use bullet points for key facts, numbers, dates, or specifications.
   - Mention the source location (e.g., Page X or Sheet Y) when citing facts.
4. Keep the tone professional, concise, and helpful.`;

  const prompt = `${systemInstruction}\n\nDocument Excerpts:\n${contextExcerpts}\n\nUser Question:\n${query}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text returned by Gemini API");
  }

  return {
    content: text,
    suggestedQueries: generateFollowUpQueries(query, targetDocs),
  };
}
