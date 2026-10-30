package com.docusphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String id;
    private String sender; // user, assistant, system
    private String content;
    private String timestamp;
    @Builder.Default
    private List<CitationDto> citations = new ArrayList<>();
    @Builder.Default
    private List<String> suggestedQueries = new ArrayList<>();
}
