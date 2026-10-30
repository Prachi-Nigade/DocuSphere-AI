package com.docusphere.backend.repository;

import com.docusphere.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findAllByOrderByUploadedAtDesc();
    List<Document> findByStatus(String status);
}
