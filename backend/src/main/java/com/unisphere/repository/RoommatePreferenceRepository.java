package com.unisphere.repository;

import com.unisphere.model.RoommatePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoommatePreferenceRepository extends JpaRepository<RoommatePreference, UUID> {

    @Query("SELECT rp FROM RoommatePreference rp JOIN rp.user u " +
           "JOIN StudentProfile sp ON sp.id = u.id " +
           "WHERE u.id != :activeUserId " +
           "AND sp.gender = :gender " +
           "AND sp.currentCity = :city")
    List<RoommatePreference> findCandidates(
            @Param("activeUserId") UUID activeUserId,
            @Param("gender") String gender,
            @Param("city") String city
    );
}
