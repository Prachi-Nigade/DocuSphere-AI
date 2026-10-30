package com.docusphere.backend.service;

import com.docusphere.backend.dto.DocumentResponseDto;
import com.docusphere.backend.dto.DocumentStatusDto;
import com.docusphere.backend.entity.Document;
import com.docusphere.backend.entity.DocumentChunk;
import com.docusphere.backend.exception.ResourceNotFoundException;
import com.docusphere.backend.repository.DocumentChunkRepository;
import com.docusphere.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final VectorSearchService vectorSearchService;

    public List<DocumentResponseDto> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public DocumentResponseDto getDocumentById(String id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
        return mapToDto(doc);
    }

    public DocumentStatusDto getIngestionStatus(String id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        long chunksCount = chunkRepository.countByDocumentId(id);
        int expected = doc.getChunksCount() != null && doc.getChunksCount() > 0 ? doc.getChunksCount() : 1;
        int progress = (int) Math.min(100, (chunksCount * 100) / expected);

        return DocumentStatusDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .status(doc.getStatus())
                .chunksIndexed((int) chunksCount)
                .totalChunksExpected(expected)
                .progressPercentage(progress)
                .message("Document is " + doc.getStatus() + " with " + chunksCount + " chunks indexed in pgvector")
                .build();
    }

    @Transactional
    public DocumentResponseDto ingestDocument(MultipartFile file) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String extension = getFileExtension(filename).toLowerCase();
        String format = determineFormat(extension);
        String docId = "doc-" + UUID.randomUUID().toString().substring(0, 8);
        String fileSizeStr = formatFileSize(file.getSize());

        log.info("Ingesting document: {} [ID: {}, Format: {}, Size: {}]", filename, docId, format, fileSizeStr);

        Document doc = Document.builder()
                .id(docId)
                .name(filename)
                .format(format)
                .size(fileSizeStr)
                .status("processing")
                .chunksCount(0)
                .embeddingModel("text-embedding-3-large")
                .uploadedAt(Instant.now())
                .build();

        doc = documentRepository.save(doc);

        try {
            // Read lines and chunk content
            List<String> rawChunks = extractAndChunkText(file);
            List<DocumentChunk> chunks = new ArrayList<>();

            for (int i = 0; i < rawChunks.size(); i++) {
                String chunkText = rawChunks.get(i);
                float[] embedding = vectorSearchService.generateEmbedding(chunkText);

                DocumentChunk chunk = DocumentChunk.builder()
                        .id("chunk-" + docId + "-" + (i + 1))
                        .document(doc)
                        .chunkIndex(i + 1)
                        .content(chunkText)
                        .pageNumber((i / 3) + 1)
                        .paragraphId("p-" + ((i / 3) + 1) + "-" + ((i % 3) + 1))
                        .embedding(embedding)
                        .createdAt(Instant.now())
                        .build();

                chunks.add(chunk);
            }

            chunkRepository.saveAll(chunks);

            doc.setStatus("indexed");
            doc.setChunksCount(chunks.size());
            doc.setPages(Math.max(1, (chunks.size() / 3) + 1));
            documentRepository.save(doc);

            log.info("Successfully vectorized & stored {} chunks for document {}", chunks.size(), docId);
        } catch (Exception e) {
            log.error("Failed to ingest document: {}", docId, e);
            doc.setStatus("failed");
            documentRepository.save(doc);
            throw new RuntimeException("Ingestion failed: " + e.getMessage(), e);
        }

        return mapToDto(doc);
    }

    @Transactional
    public void deleteDocument(String id) {
        if (!documentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Document not found with ID: " + id);
        }
        chunkRepository.deleteByDocumentId(id);
        documentRepository.deleteById(id);
        log.info("Deleted document and associated vector chunks for ID: {}", id);
    }

    private List<String> extractAndChunkText(MultipartFile file) throws Exception {
        List<String> chunks = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty() && sb.length() > 200) {
                    chunks.add(sb.toString().trim());
                    sb.setLength(0);
                } else {
                    sb.append(line).append(" ");
                }
            }
            if (sb.length() > 0) {
                chunks.add(sb.toString().trim());
            }
        }
        if (chunks.isEmpty()) {
            chunks.add("Uploaded document content from: " + file.getOriginalFilename());
        }
        return chunks;
    }

    private String determineFormat(String ext) {
        return switch (ext) {
            case "pdf" -> "pdf";
            case "xlsx", "xls", "csv" -> "excel";
            case "docx", "doc" -> "docx";
            case "md", "markdown" -> "markdown";
            default -> "txt";
        };
    }

    private String getFileExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char unit = "KMGTPE".charAt(exp - 1);
        return String.format(Locale.US, "%.1f %cB", bytes / Math.pow(1024, exp), unit);
    }

    private DocumentResponseDto mapToDto(Document doc) {
        return DocumentResponseDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .format(doc.getFormat())
                .size(doc.getSize())
                .pages(doc.getPages())
                .sheetsCount(doc.getSheetsCount())
                .rowsCount(doc.getRowsCount())
                .sectionsCount(doc.getSectionsCount())
                .status(doc.getStatus())
                .chunksCount(doc.getChunksCount())
                .embeddingModel(doc.getEmbeddingModel())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
