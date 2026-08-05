package com.unisphere.controller;

import com.unisphere.dto.ProfileResponse;
import com.unisphere.dto.RoommateActionRequest;
import com.unisphere.dto.RoommateActionResponse;
import com.unisphere.model.RoommateAction;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.User;
import com.unisphere.repository.RoommateActionRepository;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.UserRepository;
import com.unisphere.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/roommates")
@RequiredArgsConstructor
public class RoommateActionController {

    private final RoommateActionRepository roommateActionRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    @PostMapping("/swipe")
    public ResponseEntity<RoommateActionResponse> swipe(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody RoommateActionRequest request) {

        UUID actorId = principal.getId();
        UUID targetId = request.getTargetUserId();

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalArgumentException("Actor user not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        RoommateAction.ActionType actionType = RoommateAction.ActionType.valueOf(request.getActionType().toUpperCase());

        // Check for existing swipe action to update it or ignore
        Optional<RoommateAction> existingActionOpt = roommateActionRepository.findByActorIdAndTargetId(actorId, targetId);
        RoommateAction action;
        if (existingActionOpt.isPresent()) {
            action = existingActionOpt.get();
            action.setActionType(actionType);
        } else {
            action = RoommateAction.builder()
                    .actor(actor)
                    .target(target)
                    .actionType(actionType)
                    .build();
        }
        roommateActionRepository.save(action);

        boolean mutualMatch = false;
        ProfileResponse matchProfile = null;

        // If swiped INTERESTED, check for mutual interest
        if (actionType == RoommateAction.ActionType.INTERESTED) {
            Optional<RoommateAction> reverseActionOpt = roommateActionRepository.findByActorIdAndTargetId(targetId, actorId);
            if (reverseActionOpt.isPresent() && reverseActionOpt.get().getActionType() == RoommateAction.ActionType.INTERESTED) {
                mutualMatch = true;
                StudentProfile profile = studentProfileRepository.findById(targetId)
                        .orElse(null);
                if (profile != null) {
                    matchProfile = mapToResponse(profile);
                }
            }
        }

        return ResponseEntity.ok(RoommateActionResponse.builder()
                .mutualMatch(mutualMatch)
                .matchProfile(matchProfile)
                .build());
    }

    @GetMapping("/matches")
    public ResponseEntity<List<ProfileResponse>> getMatches(@AuthenticationPrincipal UserPrincipal principal) {
        List<User> matchedUsers = roommateActionRepository.findMutualMatches(principal.getId());
        List<ProfileResponse> response = matchedUsers.stream()
                .map(user -> studentProfileRepository.findById(user.getId()).orElse(null))
                .filter(profile -> profile != null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/saved")
    public ResponseEntity<List<ProfileResponse>> getSaved(@AuthenticationPrincipal UserPrincipal principal) {
        List<User> savedUsers = roommateActionRepository.findSavedRoommates(principal.getId());
        List<ProfileResponse> response = savedUsers.stream()
                .map(user -> studentProfileRepository.findById(user.getId()).orElse(null))
                .filter(profile -> profile != null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private ProfileResponse mapToResponse(StudentProfile profile) {
        int completeness = 20; // Default base for registration
        if (profile.getAge() > 0) completeness += 10;
        if (profile.getPreferredRelocationCity() != null && !profile.getPreferredRelocationCity().isBlank()) completeness += 10;
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
