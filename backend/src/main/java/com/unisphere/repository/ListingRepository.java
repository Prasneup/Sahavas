package com.unisphere.repository;

import com.unisphere.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    @Query(value = "SELECT * FROM listings l " +
           "WHERE ST_DWithin(l.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :distanceMeters) " +
           "AND l.is_available = TRUE AND l.verification_status = 'APPROVED' " +
           "ORDER BY ST_Distance(l.geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) ASC", 
           nativeQuery = true)
    List<Listing> findListingsNear(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("distanceMeters") double distanceMeters
    );

    List<Listing> findByOwnerId(UUID ownerId);
}
