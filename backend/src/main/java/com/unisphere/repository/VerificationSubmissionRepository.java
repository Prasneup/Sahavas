package com.unisphere.repository;

import com.unisphere.model.VerificationSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationSubmissionRepository extends JpaRepository<VerificationSubmission, UUID> {
    List<VerificationSubmission> findAllByStatusOrderBySubmittedAtAsc(String status);
    Optional<VerificationSubmission> findFirstByUserIdOrderBySubmittedAtDesc(UUID userId);
    List<VerificationSubmission> findAllByUserIdOrderBySubmittedAtDesc(UUID userId);
}
