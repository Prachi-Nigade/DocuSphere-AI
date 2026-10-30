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
public class ChatResponseDto {

    private String messageId;
    private String threadId;
    private String sender;
    private String content;
    private String timestamp;
    @Builder.Default
    private List<CitationDto> citations = new ArrayList<>();
    @Builder.Default
    private List<String> suggestedQueries = new ArrayList<>();
}
