package com.unisphere.repository;

import com.unisphere.model.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID> {
    List<AdminAuditLog> findAllByOrderByCreatedAtDesc();
}
