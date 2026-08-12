package com.unisphere.repository;

import com.unisphere.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    java.util.List<StudentProfile> findAllByVerificationStatus(String status);
    long countByVerificationStatus(String status);
}
