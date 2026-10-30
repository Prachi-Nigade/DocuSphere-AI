package com.docusphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreadDto {
    private String id;
    private String title;
    private String preview;
    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private List<MessageDto> messages = new ArrayList<>();
}
