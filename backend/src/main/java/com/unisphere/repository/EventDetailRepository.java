package com.unisphere.repository;

import com.unisphere.model.EventDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EventDetailRepository extends JpaRepository<EventDetail, UUID> {
}
