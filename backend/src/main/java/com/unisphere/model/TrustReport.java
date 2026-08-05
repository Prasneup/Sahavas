package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "trust_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "reported_user_id", nullable = false)
    private UUID reportedUserId;

    @Column(nullable = false, length = 100)
    private String reason; // "SPAM", "DEPOSIT_FRAUD", "HARASSMENT", etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_status", length = 20, nullable = false)
    private ReportStatus status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        status = ReportStatus.PENDING;
    }

    public enum ReportStatus {
        PENDING,
        RESOLVED,
        REJECTED
    }
}
