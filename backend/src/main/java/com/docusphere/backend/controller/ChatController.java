package com.docusphere.backend.controller;

import com.docusphere.backend.dto.ChatRequestDto;
import com.docusphere.backend.dto.ChatResponseDto;
import com.docusphere.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/query")
    public ResponseEntity<ChatResponseDto> askQuestion(@Valid @RequestBody ChatRequestDto request) {
        ChatResponseDto response = chatService.processQuery(request);
        return ResponseEntity.ok(response);
    }
}
