package com.unisphere.repository;

import com.unisphere.model.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CollegeRepository extends JpaRepository<College, UUID> {
}
