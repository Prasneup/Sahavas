package com.unisphere.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotNull(message = "Rent amount is required")
    @DecimalMin(value = "0.0", message = "Rent must be positive")
    @Column(name = "rent_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount;

    @NotNull(message = "Deposit amount is required")
    @DecimalMin(value = "0.0", message = "Deposit must be positive")
    @Column(name = "deposit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @NotNull(message = "Latitude is required")
    @Column(name = "location_lat", nullable = false)
    private Double locationLat;

    @NotNull(message = "Longitude is required")
    @Column(name = "location_lng", nullable = false)
    private Double locationLng;

    @NotBlank(message = "Room type is required")
    @Column(name = "room_type", nullable = false, length = 20)
    private String roomType; // SINGLE_ROOM, SHARED_ROOM, FLAT

    @Column(name = "gender_preference", nullable = false, length = 15)
    private String genderPreference; // BOYS_ONLY, GIRLS_ONLY, ANY

    @Column(name = "distance_from_college_text", length = 100)
    private String distanceFromCollegeText; // e.g. "200m from IOE Pulchowk Gate"

    @Column(name = "rating")
    @Builder.Default
    private Double rating = 5.0;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "listing_amenities", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "amenity")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ListingImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void normalizeFields() {
        if (roomType != null) {
            String clean = roomType.toLowerCase().trim();
            if (clean.contains("single")) {
                roomType = "single_room";
            } else if (clean.contains("shared")) {
                roomType = "shared_room";
            } else if (clean.contains("flat")) {
                roomType = "full_flat";
            } else if (clean.contains("annex")) {
                roomType = "annex";
            } else {
                roomType = "single_room";
            }
        } else {
            roomType = "single_room";
        }

        if (genderPreference != null) {
            String clean = genderPreference.toLowerCase().trim();
            if (clean.contains("boy") || clean.contains("male")) {
                genderPreference = "male";
            } else if (clean.contains("girl") || clean.contains("female")) {
                genderPreference = "female";
            } else {
                genderPreference = "any";
            }
        } else {
            genderPreference = "any";
        }
    }
}
