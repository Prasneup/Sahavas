package com.unisphere.repository;

import com.unisphere.model.Conversation;
import com.unisphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByParticipantId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c WHERE :userA MEMBER OF c.participants AND :userB MEMBER OF c.participants")
    Optional<Conversation> findConversationBetweenUsers(@Param("userA") User userA, @Param("userB") User userB);
}
