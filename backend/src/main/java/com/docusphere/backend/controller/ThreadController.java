package com.docusphere.backend.controller;

import com.docusphere.backend.dto.ThreadDto;
import com.docusphere.backend.service.ThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/threads")
@RequiredArgsConstructor
public class ThreadController {

    private final ThreadService threadService;

    @GetMapping
    public ResponseEntity<List<ThreadDto>> listThreads() {
        return ResponseEntity.ok(threadService.getAllThreads());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThreadDto> getThread(@PathVariable String id) {
        return ResponseEntity.ok(threadService.getThreadById(id));
    }

    @PostMapping
    public ResponseEntity<ThreadDto> createThread(@RequestBody(required = false) Map<String, String> payload) {
        String title = (payload != null) ? payload.get("title") : "New Knowledge Inquiry";
        ThreadDto created = threadService.createThread(title);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThreadDto> updateThreadTitle(
            @PathVariable String id,
            @RequestBody Map<String, String> payload
    ) {
        String title = payload.getOrDefault("title", "Updated Thread");
        ThreadDto updated = threadService.updateTitle(id, title);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteThread(@PathVariable String id) {
        threadService.deleteThread(id);
        return ResponseEntity.ok(Map.of("message", "Thread deleted successfully", "id", id));
    }
}
