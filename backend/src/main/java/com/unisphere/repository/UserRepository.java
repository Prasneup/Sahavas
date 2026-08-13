package com.unisphere.repository;

import com.unisphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByPhoneNumberOrEmail(String phoneNumber, String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
}
