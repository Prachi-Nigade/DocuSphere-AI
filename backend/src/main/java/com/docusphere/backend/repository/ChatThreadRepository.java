package com.docusphere.backend.repository;

import com.docusphere.backend.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, String> {
    List<ChatThread> findAllByOrderByUpdatedAtDesc();
}
