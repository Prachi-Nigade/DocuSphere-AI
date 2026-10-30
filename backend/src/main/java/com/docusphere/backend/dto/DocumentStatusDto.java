package com.docusphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStatusDto {
    private String id;
    private String name;
    private String status; // uploaded, processing, indexed, failed
    private Integer chunksIndexed;
    private Integer totalChunksExpected;
    private Integer progressPercentage;
    private String message;
}
