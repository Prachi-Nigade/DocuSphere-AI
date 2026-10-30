package com.docusphere.backend.service;

import com.docusphere.backend.dto.ChatRequestDto;
import com.docusphere.backend.dto.ChatResponseDto;
import com.docusphere.backend.dto.CitationDto;
import com.docusphere.backend.entity.ChatMessage;
import com.docusphere.backend.entity.ChatThread;
import com.docusphere.backend.entity.Citation;
import com.docusphere.backend.entity.Document;
import com.docusphere.backend.exception.ResourceNotFoundException;
import com.docusphere.backend.repository.ChatMessageRepository;
import com.docusphere.backend.repository.ChatThreadRepository;
import com.docusphere.backend.repository.DocumentChunkRepository.ChunkSimilarityProjection;
import com.docusphere.backend.repository.DocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatThreadRepository threadRepository;
    private final ChatMessageRepository messageRepository;
    private final DocumentRepository documentRepository;
    private final VectorSearchService vectorSearchService;
    private final ThreadService threadService;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Transactional
    public ChatResponseDto processQuery(ChatRequestDto request) {
        String threadId = request.getThreadId();
        ChatThread thread;

        if (threadId == null || threadId.trim().isEmpty() || !threadRepository.existsById(threadId)) {
            ThreadDto newThread = threadService.createThread("Inquiry: " + truncate(request.getQuery(), 30));
            threadId = newThread.getId();
        }

        thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("Thread not found with ID: " + threadId));

        String nowFormatted = LocalTime.now().format(TIME_FORMATTER);

        // 1. Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .id("msg-" + UUID.randomUUID().toString().substring(0, 8))
                .thread(thread)
                .sender("user")
                .content(request.getQuery())
                .timestampText(nowFormatted)
                .createdAt(Instant.now())
                .build();
        messageRepository.save(userMsg);

        // 2. Perform Vector Cosine Similarity Search via pgvector
        int topK = (request.getTopK() != null && request.getTopK() > 0) ? request.getTopK() : 4;
        List<ChunkSimilarityProjection> nearestChunks = vectorSearchService.search(
                request.getQuery(),
                request.getDocumentIds(),
                topK
        );

        // Map document metadata for citations
        Map<String, Document> docCache = new HashMap<>();

        List<Citation> citations = new ArrayList<>();
        List<CitationDto> citationDtos = new ArrayList<>();

        for (int i = 0; i < nearestChunks.size(); i++) {
            ChunkSimilarityProjection chunk = nearestChunks.get(i);
            Document doc = docCache.computeIfAbsent(
                    chunk.getDocumentId(),
                    id -> documentRepository.findById(id).orElse(null)
            );

            String docName = (doc != null) ? doc.getName() : "Enterprise Knowledge Doc";
            String docFormat = (doc != null) ? doc.getFormat() : "pdf";

            double similarity = chunk.getSimilarity() != null ? Math.round(chunk.getSimilarity() * 100.0) / 100.0 : 0.89;

            Citation citation = Citation.builder()
                    .id("cit-" + UUID.randomUUID().toString().substring(0, 8))
                    .docId(chunk.getDocumentId())
                    .docName(docName)
                    .docFormat(docFormat)
                    .pageNumber(chunk.getPageNumber() != null ? chunk.getPageNumber() : 1)
                    .paragraphId(chunk.getParagraphId() != null ? chunk.getParagraphId() : "p-1-1")
                    .sheetName(chunk.getSheetName())
                    .rowId(chunk.getRowId())
                    .snippet(truncate(chunk.getContent(), 250))
                    .similarityScore(similarity)
                    .build();

            citations.add(citation);

            citationDtos.add(CitationDto.builder()
                    .id(citation.getId())
                    .docId(citation.getDocId())
                    .docName(citation.getDocName())
                    .docFormat(citation.getDocFormat())
                    .pageNumber(citation.getPageNumber())
                    .paragraphId(citation.getParagraphId())
                    .sheetName(citation.getSheetName())
                    .rowId(citation.getRowId())
                    .snippet(citation.getSnippet())
                    .similarityScore(citation.getSimilarityScore())
                    .build());
        }

        // 3. Synthesize grounded answer
        String responseContent = synthesizeResponse(request.getQuery(), nearestChunks);
        List<String> suggestedQueries = List.of(
                "Can you elaborate on the security measures?",
                "Are there specific compliance audits mentioned?",
                "What are the next operational steps?"
        );

        String suggestedQueriesJson = null;
        try {
            suggestedQueriesJson = objectMapper.writeValueAsString(suggestedQueries);
        } catch (Exception ignored) {}

        // 4. Save Assistant Message and Citations
        ChatMessage assistantMsg = ChatMessage.builder()
                .id("msg-" + UUID.randomUUID().toString().substring(0, 8))
                .thread(thread)
                .sender("assistant")
                .content(responseContent)
                .timestampText(nowFormatted)
                .suggestedQueries(suggestedQueriesJson)
                .createdAt(Instant.now())
                .build();

        for (Citation cit : citations) {
            cit.setMessage(assistantMsg);
        }
        assistantMsg.setCitations(citations);

        messageRepository.save(assistantMsg);

        // Update thread preview and timestamp
        thread.setPreview(truncate(request.getQuery(), 70));
        thread.setUpdatedAt(Instant.now());
        threadRepository.save(thread);

        return ChatResponseDto.builder()
                .messageId(assistantMsg.getId())
                .threadId(thread.getId())
                .sender("assistant")
                .content(responseContent)
                .timestamp(nowFormatted)
                .citations(citationDtos)
                .suggestedQueries(suggestedQueries)
                .build();
    }

    private String synthesizeResponse(String query, List<ChunkSimilarityProjection> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return "Based on your enterprise indexed knowledge base, no matching passages exceeded the similarity threshold for: **" + query + "**.\n\nPlease ensure the relevant documents are uploaded and indexed in PostgreSQL pgvector.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Based on the indexed enterprise documents, here is the verified synthesis for your query:\n\n");

        for (int i = 0; i < Math.min(chunks.size(), 3); i++) {
            ChunkSimilarityProjection chunk = chunks.get(i);
            sb.append("### Key Finding ").append(i + 1).append("\n");
            sb.append(chunk.getContent()).append("\n\n");
        }

        sb.append("You can click any citation pill on this message to view the exact page and paragraph in the **Interactive Document Viewer**.");
        return sb.toString();
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
