import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { getFileFormat } from "./documentUtils";

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
export function formatFileSize(bytes = 0) {
  if (bytes < 1024) return bytes + " B";
  const exp = Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024)));
  const units = ["B", "KB", "MB", "GB", "TB"];
  return (bytes / Math.pow(1024, exp)).toFixed(1) + " " + units[exp];
}

/**
 * Parse an uploaded document file across PDF, Excel, Word, Text, Markdown
 */
export async function parseDocumentFile(file, onProgress) {
  const filename = file.name || "document.txt";
  const format = getFileFormat(filename);
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const sizeStr = formatFileSize(file.size);

  onProgress?.(15);

  let parsedResult = {
    chunks: [],
    fullText: "",
    pagesData: undefined,
    sheetsData: undefined,
    sectionsData: undefined,
    content: undefined,
    pages: undefined,
    sheetsCount: undefined,
    rowsCount: undefined,
    sectionsCount: undefined,
  };

  try {
    if (format === "pdf") {
      parsedResult = await parsePdf(file, onProgress);
    } else if (format === "excel") {
      parsedResult = await parseExcel(file, onProgress);
    } else if (format === "docx") {
      parsedResult = await parseDocx(file, onProgress);
    } else {
      parsedResult = await parseText(file, onProgress);
    }
  } catch (err) {
    console.error(`Error parsing ${filename} (${format}):`, err);
    // Fallback text extraction if binary parser fails
    try {
      const fallbackText = await file.text();
      parsedResult = createTextFallback(fallbackText, filename);
    } catch {
      parsedResult = {
        chunks: [
          {
            id: `chunk-1`,
            text: `Uploaded document: ${filename}. Content could not be read cleanly.`,
          },
        ],
        fullText: `Uploaded document: ${filename}`,
        content: `Uploaded document: ${filename}`,
      };
    }
  }

  onProgress?.(90);

  // Tag all chunks with document metadata for RAG citations
  const enrichedChunks = (parsedResult.chunks || []).map((chunk, idx) => ({
    ...chunk,
    id: chunk.id || `chunk-${docId}-${idx + 1}`,
    docId: docId,
    docName: filename,
    format: format,
  }));

  const docObject = {
    id: docId,
    name: filename,
    format: format,
    size: sizeStr,
    pages: parsedResult.pages,
    sheetsCount: parsedResult.sheetsCount,
    rowsCount: parsedResult.rowsCount,
    sectionsCount: parsedResult.sectionsCount,
    uploadedAt: "Just now",
    status: "indexed",
    progress: 100,
    chunksCount: enrichedChunks.length,
    chunks: enrichedChunks,
    pagesData: parsedResult.pagesData,
    sheetsData: parsedResult.sheetsData,
    sectionsData: parsedResult.sectionsData,
    content: parsedResult.content,
    embeddingModel: "semantic-rag-v2",
  };

  docObject.suggestedQuestions = generateSuggestedQuestions(docObject);
  onProgress?.(100);

  return docObject;
}

/**
 * PDF Parser: Extracts text per page and builds paragraph structure
 */
async function parsePdf(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pagesData = [];
  const chunks = [];
  let fullText = "";

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.(15 + Math.round((pageNum / numPages) * 70));
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines based on vertical Y position
    const lineMap = new Map();
    for (const item of textContent.items) {
      if (!item.str || !item.str.trim()) continue;
      const y = item.transform ? Math.round(item.transform[5] / 4) * 4 : 0;
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y).push(item.str);
    }

    // Sort descending by Y coordinate (top to bottom of page)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const lines = sortedYs.map((y) => lineMap.get(y).join(" ").trim()).filter(Boolean);

    // Group lines into paragraphs (accumulate ~2-4 sentences or break on short lines)
    const paragraphs = [];
    let currentP = "";

    for (const line of lines) {
      if (
        currentP &&
        (currentP.length > 220 ||
          currentP.endsWith(".") ||
          currentP.endsWith(":") ||
          line.length < 25)
      ) {
        paragraphs.push({
          id: `p-${pageNum}-${paragraphs.length + 1}`,
          text: currentP.trim(),
        });
        currentP = line;
      } else {
        currentP += (currentP ? " " : "") + line;
      }
    }
    if (currentP.trim()) {
      paragraphs.push({
        id: `p-${pageNum}-${paragraphs.length + 1}`,
        text: currentP.trim(),
      });
    }

    if (paragraphs.length === 0) {
      paragraphs.push({
        id: `p-${pageNum}-1`,
        text: `Page ${pageNum} contains graphical or non-textual elements.`,
      });
    }

    pagesData.push({
      pageNumber: pageNum,
      paragraphs: paragraphs,
    });

    paragraphs.forEach((p, pIdx) => {
      chunks.push({
        id: `chunk-p-${pageNum}-${pIdx + 1}`,
        pageNumber: pageNum,
        paragraphId: p.id,
        text: p.text,
      });
      fullText += p.text + "\n\n";
    });
  }

  return { pagesData, chunks, fullText, pages: numPages };
}

/**
 * Excel Parser: Extracts sheets, headers, and rows into structured tables and readable chunks
 */
async function parseExcel(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetNames = workbook.SheetNames || [];
  const sheetsData = [];
  const chunks = [];
  let totalRows = 0;
  let fullText = "";

  for (let sIdx = 0; sIdx < sheetNames.length; sIdx++) {
    onProgress?.(20 + Math.round(((sIdx + 1) / sheetNames.length) * 65));
    const sheetName = sheetNames[sIdx];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!rawRows || rawRows.length === 0) continue;

    // Header row
    const rawHeaderRow = rawRows[0] || [];
    const headers = rawHeaderRow.map((h, i) =>
      h && String(h).trim() ? String(h).trim() : `Column ${i + 1}`
    );

    const rows = [];
    for (let rIdx = 1; rIdx < rawRows.length; rIdx++) {
      const rowArr = rawRows[rIdx];
      if (!rowArr || rowArr.every((cell) => cell === "" || cell == null)) continue;

      const rowObj = { id: `row-${rIdx}` };
      const summaryParts = [];

      headers.forEach((header, hIdx) => {
        const val = rowArr[hIdx] != null ? String(rowArr[hIdx]).trim() : "";
        rowObj[header] = val;
        if (val) {
          summaryParts.push(`${header}: ${val}`);
        }
      });

      rows.push(rowObj);

      const rowSummary = `[Sheet: ${sheetName}, Row ${rIdx}] ${summaryParts.join(" | ")}`;
      chunks.push({
        id: `chunk-sheet-${sIdx + 1}-r-${rIdx}`,
        sheetName: sheetName,
        rowId: `row-${rIdx}`,
        row: rIdx,
        text: rowSummary,
        rowData: rowObj,
      });
      fullText += rowSummary + "\n";
    }

    sheetsData.push({
      name: sheetName,
      headers: headers,
      rows: rows,
    });
    totalRows += rows.length;
  }

  return {
    sheetsData,
    chunks,
    fullText,
    sheetsCount: sheetNames.length,
    rowsCount: totalRows,
  };
}

/**
 * Word Parser: Extracts text and paragraphs from .docx using Mammoth
 */
async function parseDocx(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(40);
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || "";
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sectionsData = [];
  const chunks = [];
  const pageSize = 5;
  let currentSection = { title: "Section 1", page: 1, paragraphs: [] };

  lines.forEach((line) => {
    const isHeading =
      line.length < 55 &&
      (line.endsWith(":") || !line.endsWith(".") || line.startsWith("Section"));

    if (isHeading && currentSection.paragraphs.length > 0) {
      sectionsData.push(currentSection);
      currentSection = {
        title: line,
        page: sectionsData.length + 1,
        paragraphs: [],
      };
    }

    const pObj = {
      id: `docx-p-${currentSection.page}-${currentSection.paragraphs.length + 1}`,
      text: line,
    };
    currentSection.paragraphs.push(pObj);

    chunks.push({
      id: `chunk-docx-${chunks.length + 1}`,
      sectionTitle: currentSection.title,
      pageNumber: currentSection.page,
      paragraphId: pObj.id,
      text: line,
    });

    if (currentSection.paragraphs.length >= pageSize) {
      sectionsData.push(currentSection);
      currentSection = {
        title: `Section ${sectionsData.length + 1}`,
        page: sectionsData.length + 1,
        paragraphs: [],
      };
    }
  });

  if (currentSection.paragraphs.length > 0) {
    sectionsData.push(currentSection);
  }

  return {
    sectionsData,
    chunks,
    fullText: rawText,
    sectionsCount: Math.max(1, sectionsData.length),
  };
}

/**
 * Text / Markdown Parser: Extracts plain text and paragraph blocks
 */
async function parseText(file, onProgress) {
  onProgress?.(30);
  const text = await file.text();
  onProgress?.(60);

  const lines = text.split(/\r?\n/);
  const chunks = [];
  const paragraphs = [];
  let currentP = "";
  let pIdx = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentP.trim()) {
        const pObj = {
          id: `txt-p-${pIdx++}`,
          text: currentP.trim(),
          line: i,
        };
        paragraphs.push(pObj);
        chunks.push({
          id: `chunk-txt-${chunks.length + 1}`,
          paragraphId: pObj.id,
          line: i,
          text: currentP.trim(),
        });
        currentP = "";
      }
    } else {
      currentP += (currentP ? " " : "") + line;
    }
  }

  if (currentP.trim()) {
    const pObj = {
      id: `txt-p-${pIdx++}`,
      text: currentP.trim(),
      line: lines.length,
    };
    paragraphs.push(pObj);
    chunks.push({
      id: `chunk-txt-${chunks.length + 1}`,
      paragraphId: pObj.id,
      line: lines.length,
      text: currentP.trim(),
    });
  }

  return {
    content: text,
    paragraphs,
    chunks,
    fullText: text,
    sectionsCount: Math.max(1, Math.ceil(lines.length / 40)),
  };
}

function createTextFallback(text, _filename) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < lines.length; i += 3) {
    const slice = lines.slice(i, i + 3).join(" ");
    if (slice.trim()) {
      chunks.push({
        id: `chunk-${chunks.length + 1}`,
        paragraphId: `p-${chunks.length + 1}`,
        text: slice.trim(),
      });
    }
  }
  return {
    content: text,
    chunks,
    fullText: text,
  };
}

/**
 * Dynamically generate 3 relevant suggested questions based on real document contents
 */
export function generateSuggestedQuestions(doc) {
  const questions = [];
  const format = doc.format;

  if (format === "excel" && doc.sheetsData?.[0]) {
    const sheet = doc.sheetsData[0];
    const headers = sheet.headers || [];
    questions.push(`Summarize the key metrics in sheet "${sheet.name}"`);
    if (headers.length > 1) {
      questions.push(`What is the breakdown of ${headers[1]} across all rows?`);
    }
    if (headers.length > 2) {
      questions.push(`Compare the data for ${headers[0]} and ${headers[2]}`);
    } else {
      questions.push(`Which entries show the highest figures in "${sheet.name}"?`);
    }
  } else {
    questions.push(`Provide a clear executive summary of ${doc.name}`);

    const sample = (doc.chunks || [])
      .slice(0, 6)
      .map((c) => c.text)
      .join(" ")
      .toLowerCase();

    if (sample.includes("security") || sample.includes("encrypt") || sample.includes("auth")) {
      questions.push("What security protocols or standards are specified in this document?");
    } else if (sample.includes("revenue") || sample.includes("profit") || sample.includes("cost") || sample.includes("financial")) {
      questions.push("What are the key financial numbers, revenues, or costs mentioned?");
    } else if (sample.includes("agreement") || sample.includes("contract") || sample.includes("terms") || sample.includes("liability")) {
      questions.push("What are the primary terms, obligations, or liability clauses?");
    } else if (sample.includes("api") || sample.includes("database") || sample.includes("architecture")) {
      questions.push("What are the technical architecture specifications and endpoints?");
    } else {
      questions.push("What are the main findings, objectives, and conclusions?");
    }

    questions.push("What are the most critical actionable takeaways outlined?");
  }

  return questions.slice(0, 3);
}
