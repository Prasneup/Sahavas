package com.unisphere.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Gender selection is required")
    @Column(nullable = false, length = 10)
    private String gender; // MALE, FEMALE, OTHER

    @Column(name = "age")
    private Integer age;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @Column(name = "major_course", length = 100)
    private String majorCourse;

    @Column(name = "academic_year")
    private Integer academicYear;

    @Column(name = "current_semester")
    private Integer currentSemester;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @NotBlank(message = "Hometown district is required")
    @Column(name = "hometown_district", nullable = false, length = 50)
    private String hometownDistrict; // e.g. Jhapa, Kaski, Chitwan

    @NotBlank(message = "Current target city is required")
    @Column(name = "current_city", nullable = false, length = 50)
    private String currentCity; // e.g. Kathmandu, Pokhara

    @Column(name = "preferred_relocation_city", length = 50)
    private String preferredRelocationCity;

    @Column(name = "budget_min", precision = 10, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 10, scale = 2)
    private BigDecimal budgetMax;

    @Column(name = "verification_status", length = 30)
    @Builder.Default
    private String verificationStatus = "UNVERIFIED"; // UNVERIFIED, PENDING_VERIFICATION, VERIFIED, REJECTED

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_level", length = 30)
    @Builder.Default
    private VerificationLevel verificationLevel = VerificationLevel.UNVERIFIED;

    @Column(name = "college_registration_number", length = 50)
    private String collegeRegistrationNumber;

    @Column(name = "document_image_url", length = 250)
    private String documentImageUrl;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "trust_score")
    @Builder.Default
    private int trustScore = 10; // Default base trust score for unverified accounts

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_interests", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "interest")
    @Builder.Default
    private List<String> interests = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_languages", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "language")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
