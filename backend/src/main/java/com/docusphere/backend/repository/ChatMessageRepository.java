package com.docusphere.backend.repository;

import com.docusphere.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByThreadIdOrderByCreatedAtAsc(String threadId);
    void deleteByThreadId(String threadId);
}
