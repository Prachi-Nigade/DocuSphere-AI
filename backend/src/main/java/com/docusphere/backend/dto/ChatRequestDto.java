package com.docusphere.backend.dto;

import jakarta.validation.constraints.NotBlank;
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
public class ChatRequestDto {

    private String threadId;

    @NotBlank(message = "Query prompt cannot be empty")
    private String query;

    @Builder.Default
    private List<String> documentIds = new ArrayList<>();

    @Builder.Default
    private Double temperature = 0.2;

    @Builder.Default
    private Integer topK = 4;
}
