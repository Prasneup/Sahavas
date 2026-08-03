package com.unisphere.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @Column(name = "major_course", length = 100)
    private String majorCourse;

    @Column(name = "academic_year")
    private Integer academicYear;

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
