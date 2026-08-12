package com.unisphere.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(98|97)\\d{8}$", message = "Invalid Nepalese mobile number prefix")
    @Column(name = "phone_number", unique = true, nullable = false, length = 15)
    private String phoneNumber;

    @Email(message = "Invalid email format")
    @Column(unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password hash is required")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role; // e.g. ROLE_STUDENT, ROLE_LANDLORD, ROLE_ADMIN

    @Column(nullable = false, length = 20)
    private String status; // e.g. PENDING_VERIFICATION, VERIFIED, SUSPENDED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void normalizeFields() {
        if (role != null) {
            String clean = role.toLowerCase();
            if (clean.contains("admin")) {
                role = "admin";
            } else if (clean.contains("landlord") || clean.contains("owner")) {
                role = "owner";
            } else {
                role = "student";
            }
        } else {
            role = "student";
        }

        if (status != null) {
            status = status.toLowerCase();
        } else {
            status = "pending_verification";
        }
    }
}
