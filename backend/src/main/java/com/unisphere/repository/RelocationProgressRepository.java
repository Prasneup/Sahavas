package com.unisphere.repository;

import com.unisphere.model.RelocationProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RelocationProgressRepository extends JpaRepository<RelocationProgress, UUID> {
    Optional<RelocationProgress> findByUserId(UUID userId);
}
