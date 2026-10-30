package com.docusphere.backend.entity;

import com.docusphere.backend.config.PgVectorConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "document_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentChunk {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "paragraph_id", length = 64)
    private String paragraphId;

    @Column(name = "sheet_name", length = 128)
    private String sheetName;

    @Column(name = "row_id", length = 64)
    private String rowId;

    /**
     * Vector embedding column matching PostgreSQL pgvector vector(1536).
     * Handled seamlessly via PgVectorConverter for JPA mapping and native queries.
     */
    @Convert(converter = PgVectorConverter.class)
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private float[] embedding;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
