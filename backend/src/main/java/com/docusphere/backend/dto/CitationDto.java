package com.docusphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitationDto {
    private String id;
    private String docId;
    private String docName;
    private String docFormat; // pdf, excel, markdown, docx
    private Integer pageNumber;
    private String paragraphId;
    private String sheetName;
    private String rowId;
    private String snippet;
    private Double similarityScore;
}
