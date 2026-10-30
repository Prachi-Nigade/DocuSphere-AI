package com.docusphere.backend.service;

import com.docusphere.backend.dto.HealthResponseDto;
import com.docusphere.backend.repository.DocumentChunkRepository;
import com.docusphere.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthService {

    private final JdbcTemplate jdbcTemplate;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;

    public HealthResponseDto checkHealth() {
        Map<String, Object> dbDetails = new HashMap<>();
        String dbStatus = "CONNECTED";

        try {
            // Verify PostgreSQL connection and pgvector extension status
            Boolean hasPgVector = jdbcTemplate.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')",
                    Boolean.class
            );
            dbDetails.put("status", "CONNECTED");
            dbDetails.put("databaseType", "PostgreSQL");
            dbDetails.put("pgvectorExtension", Boolean.TRUE.equals(hasPgVector) ? "ACTIVE" : "MISSING");
            dbDetails.put("totalDocuments", documentRepository.count());
            dbDetails.put("totalIndexedChunks", chunkRepository.count());
        } catch (Exception e) {
            log.error("Database health check failed", e);
            dbStatus = "DEGRADED: " + e.getMessage();
            dbDetails.put("status", "DISCONNECTED");
            dbDetails.put("error", e.getMessage());
        }

        // JVM and System Resource Telemetry
        Runtime runtime = Runtime.getRuntime();
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long maxMemory = runtime.maxMemory() / (1024 * 1024);

        Map<String, Object> sysDetails = new HashMap<>();
        sysDetails.put("jvmVersion", System.getProperty("java.version"));
        sysDetails.put("jvmVendor", System.getProperty("java.vendor"));
        sysDetails.put("availableProcessors", runtime.availableProcessors());
        sysDetails.put("freeMemoryMB", freeMemory);
        sysDetails.put("totalMemoryMB", totalMemory);
        sysDetails.put("maxMemoryMB", maxMemory);

        String overallStatus = "CONNECTED".equals(dbStatus) ? "UP" : "DOWN";

        return HealthResponseDto.builder()
                .status(overallStatus)
                .service("DocuSphere-AI Backend")
                .version("1.0.0")
                .timestamp(Instant.now())
                .database(dbDetails)
                .system(sysDetails)
                .build();
    }
}
