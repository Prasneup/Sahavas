package com.unisphere.controller;

import com.unisphere.dto.ProfileResponse;
import com.unisphere.dto.ProfileUpdateRequest;
import com.unisphere.model.StudentProfile;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final StudentProfileRepository studentProfileRepository;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfile profile = studentProfileRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        return ResponseEntity.ok(mapToResponse(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfileUpdateRequest request) {
        
        StudentProfile profile = studentProfileRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setAge(request.getAge());
        profile.setMajorCourse(request.getMajorCourse());
        profile.setAcademicYear(request.getAcademicYear());
        profile.setCurrentSemester(request.getCurrentSemester());
        profile.setAvatarUrl(request.getAvatarUrl());
        profile.setBio(request.getBio());
        profile.setHometownDistrict(request.getHometownDistrict());
        profile.setCurrentCity(request.getCurrentCity());
        profile.setPreferredRelocationCity(request.getPreferredRelocationCity());
        profile.setBudgetMin(request.getBudgetMin());
        profile.setBudgetMax(request.getBudgetMax());

        if (request.getInterests() != null) {
            profile.getInterests().clear();
            profile.getInterests().addAll(request.getInterests());
        }
        if (request.getSkills() != null) {
            profile.getSkills().clear();
            profile.getSkills().addAll(request.getSkills());
        }
        if (request.getLanguages() != null) {
            profile.getLanguages().clear();
            profile.getLanguages().addAll(request.getLanguages());
        }

        StudentProfile saved = studentProfileRepository.save(profile);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    private ProfileResponse mapToResponse(StudentProfile profile) {
        // Calculate completeness
        int completeness = 0;
        if (profile.getFullName() != null && !profile.getFullName().isBlank()) completeness += 15;
        if (profile.getGender() != null && !profile.getGender().isBlank()) completeness += 10;
        if (profile.getAge() != null) completeness += 10;
        if (profile.getMajorCourse() != null && !profile.getMajorCourse().isBlank()) completeness += 10;
        if (profile.getBio() != null && !profile.getBio().isBlank()) completeness += 15;
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isBlank()) completeness += 15;
        if (profile.getInterests() != null && !profile.getInterests().isEmpty()) completeness += 15;
        if (profile.getHometownDistrict() != null && !profile.getHometownDistrict().isBlank()) completeness += 10;

        return ProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .gender(profile.getGender())
                .age(profile.getAge())
                .collegeName(profile.getCollege() != null ? profile.getCollege().getName() : "UniSphere Affiliated College")
                .majorCourse(profile.getMajorCourse())
                .academicYear(profile.getAcademicYear())
                .currentSemester(profile.getCurrentSemester())
                .avatarUrl(profile.getAvatarUrl())
                .bio(profile.getBio())
                .hometownDistrict(profile.getHometownDistrict())
                .currentCity(profile.getCurrentCity())
                .preferredRelocationCity(profile.getPreferredRelocationCity())
                .budgetMin(profile.getBudgetMin())
                .budgetMax(profile.getBudgetMax())
                .verificationStatus(profile.getVerificationStatus())
                .completenessPercentage(Math.min(completeness, 100))
                .interests(profile.getInterests())
                .skills(profile.getSkills())
                .languages(profile.getLanguages())
                .build();
    }
}
