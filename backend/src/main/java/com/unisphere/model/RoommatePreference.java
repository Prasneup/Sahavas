package com.unisphere.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "roommate_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommatePreference {

    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @NotNull(message = "Smoking preference is required")
    private Integer smoking; // 0: Non, 1: Tolerant, 2: Heavy

    @NotNull(message = "Drinking preference is required")
    private Integer drinking; // 0: Non, 1: Social, 2: Regular

    @NotNull(message = "Sleep schedule preference is required")
    @Column(name = "sleep_schedule")
    private Integer sleepSchedule; // 0: Early Bird, 1: Night Owl

    @NotNull(message = "Cleanliness level is required")
    private Integer cleanliness; // 0: Low, 1: Moderate, 2: High

    @NotNull(message = "Budget minimum is required")
    @Column(name = "budget_min", precision = 10, scale = 2)
    private BigDecimal budgetMin;

    @NotNull(message = "Budget maximum is required")
    @Column(name = "budget_max", precision = 10, scale = 2)
    private BigDecimal budgetMax;

    @NotNull(message = "Study habits is required")
    @Column(name = "study_habits")
    private Integer studyHabits; // 0: Library/Outside, 1: In Room

    @NotNull(message = "Food preference is required")
    @Column(name = "food_preference")
    private Integer foodPreference; // 0: Vegetarian, 1: Non-Veg, 2: No Preference

    @NotNull(message = "Social level is required")
    @Column(name = "social_level")
    private Integer socialLevel; // 0: Introvert, 1: Ambivert, 2: Extrovert

    @NotNull(message = "Noise tolerance is required")
    @Column(name = "noise_tolerance")
    private Integer noiseTolerance; // 0: Quiet, 1: Moderate, 2: High

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void clampPreferences() {
        smoking = clampValue(smoking);
        drinking = clampValue(drinking);
        sleepSchedule = clampValue(sleepSchedule);
        cleanliness = clampValue(cleanliness);
        studyHabits = clampValue(studyHabits);
        foodPreference = clampValue(foodPreference);
        socialLevel = clampValue(socialLevel);
        noiseTolerance = clampValue(noiseTolerance);
    }

    private Integer clampValue(Integer val) {
        if (val == null) return 1;
        // Clamp to 1..5 range
        return Math.max(1, Math.min(5, val));
    }
}
