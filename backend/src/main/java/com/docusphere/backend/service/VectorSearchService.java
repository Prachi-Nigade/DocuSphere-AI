package com.docusphere.backend.service;

import com.docusphere.backend.repository.DocumentChunkRepository;
import com.docusphere.backend.repository.DocumentChunkRepository.ChunkSimilarityProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class VectorSearchService {

    private final DocumentChunkRepository chunkRepository;

    @Value("${docusphere.rag.embedding-dimension:1536}")
    private int embeddingDimension;

    @Value("${docusphere.rag.similarity-threshold:0.75}")
    private double similarityThreshold;

    /**
     * Converts float[] vector to standard PostgreSQL pgvector format: [v1,v2,v3,...]
     */
    public String formatVectorForPg(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Generate or mock a 1536-dimensional query embedding vector based on text hash.
     * (Easily swapped with Spring AI OpenAiEmbeddingModel in production).
     */
    public float[] generateEmbedding(String text) {
        float[] vector = new float[embeddingDimension];
        Random rnd = new Random(text.hashCode());
        float norm = 0.0f;
        for (int i = 0; i < embeddingDimension; i++) {
            vector[i] = (float) (rnd.nextGaussian());
            norm += vector[i] * vector[i];
        }
        norm = (float) Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < embeddingDimension; i++) {
                vector[i] /= norm;
            }
        }
        return vector;
    }

    /**
     * Search nearest document chunks using pgvector Cosine similarity (<=>)
     */
    public List<ChunkSimilarityProjection> search(String query, List<String> documentIds, int topK) {
        float[] queryEmbedding = generateEmbedding(query);
        String pgVectorString = formatVectorForPg(queryEmbedding);

        boolean filterDocs = documentIds != null && !documentIds.isEmpty();
        List<String> docFilter = filterDocs ? documentIds : List.of("");

        log.debug("Executing pgvector cosine search. TopK: {}, FilterDocs: {}", topK, filterDocs);

        return chunkRepository.searchSimilarChunks(
                pgVectorString,
                docFilter,
                filterDocs,
                topK
        );
    }
}
