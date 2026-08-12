package com.unisphere.repository;

import com.unisphere.model.SavedRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedRoomRepository extends JpaRepository<SavedRoom, UUID> {
    List<SavedRoom> findAllByUserId(UUID userId);
    Optional<SavedRoom> findByUserIdAndListingId(UUID userId, UUID listingId);
    boolean existsByUserIdAndListingId(UUID userId, UUID listingId);
}
