package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "registration_number", nullable = false, length = 100)
    private String registrationNumber;

    @Column(name = "document_image_url", nullable = false, length = 250)
    private String documentImageUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, UNDER_REVIEW, APPROVED, CORRECTION_REQUIRED, REJECTED, SUSPENDED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "ocr_name", length = 100)
    private String ocrName;

    @Column(name = "ocr_similarity", length = 20)
    private String ocrSimilarity; // MATCH, MISMATCH, MISSING

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private ZonedDateTime submittedAt;

    @Column(name = "reviewed_at")
    private ZonedDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;
}
