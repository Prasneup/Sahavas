package com.unisphere.repository;

import com.unisphere.model.RoommateAction;
import com.unisphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoommateActionRepository extends JpaRepository<RoommateAction, UUID> {

    Optional<RoommateAction> findByActorIdAndTargetId(UUID actorId, UUID targetId);

    @Query("SELECT a.target FROM RoommateAction a WHERE a.actor.id = :userId AND a.actionType = 'SAVE'")
    List<User> findSavedRoommates(@Param("userId") UUID userId);

    @Query("SELECT a.target FROM RoommateAction a WHERE a.actor.id = :userId AND a.actionType = 'INTERESTED' " +
           "AND EXISTS (SELECT b FROM RoommateAction b WHERE b.actor.id = a.target.id AND b.target.id = :userId AND b.actionType = 'INTERESTED')")
    List<User> findMutualMatches(@Param("userId") UUID userId);
}
