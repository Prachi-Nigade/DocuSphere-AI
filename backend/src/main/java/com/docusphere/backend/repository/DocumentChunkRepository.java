package com.docusphere.backend.repository;

import com.docusphere.backend.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, String> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(String documentId);

    void deleteByDocumentId(String documentId);

    long countByDocumentId(String documentId);

    /**
     * Interface projection to capture pgvector similarity score alongside chunk data.
     */
    interface ChunkSimilarityProjection {
        String getId();
        String getDocumentId();
        Integer getChunkIndex();
        String getContent();
        Integer getPageNumber();
        String getParagraphId();
        String getSheetName();
        String getRowId();
        Double getSimilarity();
    }

    /**
     * Native PostgreSQL + pgvector query performing Cosine Distance similarity search (<=> operator).
     * Calculates 1 - (embedding <=> queryVector) as cosine similarity score.
     */
    @Query(value = """
        SELECT 
            c.id AS id,
            c.document_id AS documentId,
            c.chunk_index AS chunkIndex,
            c.content AS content,
            c.page_number AS pageNumber,
            c.paragraph_id AS paragraphId,
            c.sheet_name AS sheetName,
            c.row_id AS rowId,
            (1 - (c.embedding <=> cast(:queryVector as vector))) AS similarity
        FROM document_chunks c
        WHERE (:filterDocs = false OR c.document_id IN (:documentIds))
        ORDER BY c.embedding <=> cast(:queryVector as vector) ASC
        LIMIT :topK
        """, nativeQuery = true)
    List<ChunkSimilarityProjection> searchSimilarChunks(
            @Param("queryVector") String queryVector,
            @Param("documentIds") List<String> documentIds,
            @Param("filterDocs") boolean filterDocs,
            @Param("topK") int topK
    );
}
