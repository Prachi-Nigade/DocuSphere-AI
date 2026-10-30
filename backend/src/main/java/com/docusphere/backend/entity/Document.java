package com.docusphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 32)
    private String format; // pdf, docx, excel, markdown, txt

    @Column(length = 32)
    private String size;

    private Integer pages;

    @Column(name = "sheets_count")
    private Integer sheetsCount;

    @Column(name = "rows_count")
    private Integer rowsCount;

    @Column(name = "sections_count")
    private Integer sectionsCount;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "indexed"; // uploaded, processing, indexed, failed

    @Column(name = "chunks_count")
    @Builder.Default
    private Integer chunksCount = 0;

    @Column(name = "embedding_model", length = 64)
    @Builder.Default
    private String embeddingModel = "text-embedding-3-large";

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentChunk> chunks = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.uploadedAt == null) {
            this.uploadedAt = Instant.now();
        }
        if (this.status == null) {
            this.status = "indexed";
        }
    }
}
