package com.docusphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "citations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citation {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    @Column(name = "doc_id", length = 64)
    private String docId;

    @Column(name = "doc_name")
    private String docName;

    @Column(name = "doc_format", length = 32)
    private String docFormat;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "paragraph_id", length = 64)
    private String paragraphId;

    @Column(name = "sheet_name", length = 128)
    private String sheetName;

    @Column(name = "row_id", length = 64)
    private String rowId;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @Column(name = "similarity_score")
    private Double similarityScore;
}
