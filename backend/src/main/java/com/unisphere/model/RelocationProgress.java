package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "relocation_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelocationProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "admission_completed", nullable = false)
    private boolean admissionCompleted;

    @Column(name = "college_confirmed", nullable = false)
    private boolean collegeConfirmed;

    @Column(name = "room_found", nullable = false)
    private boolean roomFound;

    @Column(name = "roommate_found", nullable = false)
    private boolean roommateFound;

    @Column(name = "internet_setup", nullable = false)
    private boolean internetSetup;

    @Column(name = "transportation_setup", nullable = false)
    private boolean transportationSetup;

    @Column(name = "streak_days", nullable = false)
    private int streakDays;

    @Column(name = "total_xp", nullable = false)
    private int totalXp;

    @Column(name = "unlocked_badges", length = 500)
    private String unlockedBadges; // comma-separated strings (e.g. "FRESH_MOVER,FIRST_ROOF")

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = OffsetDateTime.now();
        streakDays = 1; // Default starting streak
        totalXp = 0;
        unlockedBadges = "";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
