package com.docusphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDto {
    private String id;
    private String name;
    private String format;
    private String size;
    private Integer pages;
    private Integer sheetsCount;
    private Integer rowsCount;
    private Integer sectionsCount;
    private String status;
    private Integer chunksCount;
    private String embeddingModel;
    private Instant uploadedAt;
}
