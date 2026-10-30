package com.docusphere.backend.service;

import com.docusphere.backend.dto.CitationDto;
import com.docusphere.backend.dto.MessageDto;
import com.docusphere.backend.dto.ThreadDto;
import com.docusphere.backend.entity.ChatMessage;
import com.docusphere.backend.entity.ChatThread;
import com.docusphere.backend.entity.Citation;
import com.docusphere.backend.exception.ResourceNotFoundException;
import com.docusphere.backend.repository.ChatMessageRepository;
import com.docusphere.backend.repository.ChatThreadRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThreadService {

    private final ChatThreadRepository threadRepository;
    private final ChatMessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    public List<ThreadDto> getAllThreads() {
        return threadRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::mapToDtoSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ThreadDto getThreadById(String id) {
        ChatThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found with ID: " + id));

        List<ChatMessage> messages = messageRepository.findByThreadIdOrderByCreatedAtAsc(id);
        List<MessageDto> messageDtos = messages.stream().map(this::mapMessageToDto).toList();

        return ThreadDto.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .preview(thread.getPreview())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt())
                .messages(messageDtos)
                .build();
    }

    @Transactional
    public ThreadDto createThread(String title) {
        String threadId = "session-" + System.currentTimeMillis();
        String safeTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "New Knowledge Inquiry";

        ChatThread thread = ChatThread.builder()
                .id(threadId)
                .title(safeTitle)
                .preview("Thread started...")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        thread = threadRepository.save(thread);

        // Add default assistant welcome message
        ChatMessage welcomeMsg = ChatMessage.builder()
                .id("msg-" + UUID.randomUUID().toString().substring(0, 8))
                .thread(thread)
                .sender("assistant")
                .content("Hello! I'm your **DocuSphere-AI** assistant. How can I assist you with your knowledge documents today?")
                .timestampText("Just now")
                .suggestedQueries("[\"Summarize the latest whitepaper\",\"What are the security compliance rules?\"]")
                .createdAt(Instant.now())
                .build();

        messageRepository.save(welcomeMsg);

        return getThreadById(threadId);
    }

    @Transactional
    public ThreadDto updateTitle(String id, String newTitle) {
        ChatThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found with ID: " + id));

        thread.setTitle(newTitle);
        thread.setUpdatedAt(Instant.now());
        threadRepository.save(thread);

        return getThreadById(id);
    }

    @Transactional
    public void deleteThread(String id) {
        if (!threadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Chat thread not found with ID: " + id);
        }
        threadRepository.deleteById(id);
        log.info("Deleted chat thread with ID: {}", id);
    }

    public MessageDto mapMessageToDto(ChatMessage msg) {
        List<String> suggestions = new ArrayList<>();
        if (msg.getSuggestedQueries() != null && !msg.getSuggestedQueries().trim().isEmpty()) {
            try {
                suggestions = objectMapper.readValue(msg.getSuggestedQueries(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                suggestions = Arrays.asList(msg.getSuggestedQueries().split(";"));
            }
        }

        List<CitationDto> citations = msg.getCitations().stream().map(c -> CitationDto.builder()
                .id(c.getId())
                .docId(c.getDocId())
                .docName(c.getDocName())
                .docFormat(c.getDocFormat())
                .pageNumber(c.getPageNumber())
                .paragraphId(c.getParagraphId())
                .sheetName(c.getSheetName())
                .rowId(c.getRowId())
                .snippet(c.getSnippet())
                .similarityScore(c.getSimilarityScore())
                .build()
        ).toList();

        return MessageDto.builder()
                .id(msg.getId())
                .sender(msg.getSender())
                .content(msg.getContent())
                .timestamp(msg.getTimestampText() != null ? msg.getTimestampText() : msg.getCreatedAt().toString())
                .citations(citations)
                .suggestedQueries(suggestions)
                .build();
    }

    private ThreadDto mapToDtoSummary(ChatThread t) {
        return ThreadDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .preview(t.getPreview())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .messages(new ArrayList<>())
                .build();
    }
}
