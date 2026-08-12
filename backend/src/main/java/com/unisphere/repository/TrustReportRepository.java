package com.unisphere.repository;

import com.unisphere.model.TrustReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrustReportRepository extends JpaRepository<TrustReport, UUID> {
    List<TrustReport> findByReportedUserId(UUID reportedUserId);
    long countByReportedUserIdAndStatus(UUID reportedUserId, TrustReport.ReportStatus status);
    long countByStatus(TrustReport.ReportStatus status);
}
