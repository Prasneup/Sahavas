package com.unisphere.service;

import com.unisphere.dto.MatchingResponse;
import com.unisphere.dto.RoommateQuizRequest;
import com.unisphere.model.RoommatePreference;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.User;
import com.unisphere.repository.RoommatePreferenceRepository;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RoommatePreferenceRepository roommatePreferenceRepository;
    private final MatchingEngine matchingEngine;

    @org.springframework.beans.factory.annotation.Value("${app.matching.threshold:60.0}")
    private double matchingThreshold;

    @Transactional
    public RoommatePreference savePreferences(UUID userId, RoommateQuizRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RoommatePreference preference = roommatePreferenceRepository.findById(userId)
                .orElse(new RoommatePreference());

        preference.setUserId(userId);
        preference.setUser(user);
        preference.setSmoking(request.getSmoking());
        preference.setDrinking(request.getDrinking());
        preference.setSleepSchedule(request.getSleepSchedule());
        preference.setCleanliness(request.getCleanliness());
        preference.setBudgetMin(request.getBudgetMin());
        preference.setBudgetMax(request.getBudgetMax());
        preference.setStudyHabits(request.getStudyHabits());
        preference.setFoodPreference(request.getFoodPreference());
        preference.setSocialLevel(request.getSocialLevel());
        preference.setNoiseTolerance(request.getNoiseTolerance());

        return roommatePreferenceRepository.save(preference);
    }

    @Transactional(readOnly = true)
    public List<MatchingResponse> getSuggestions(UUID userId) {
        StudentProfile activeProfile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not setup yet"));

        RoommatePreference activePref = roommatePreferenceRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Please complete the Roommate Quiz first"));

        // Query candidates in same target city of same gender
        List<RoommatePreference> candidates = roommatePreferenceRepository.findCandidates(
                userId, activeProfile.getGender(), activeProfile.getCurrentCity()
        );

        List<MatchingResponse> suggestions = new ArrayList<>();

        for (RoommatePreference candPref : candidates) {
            Map<String, String> mismatches = new HashMap<>();
            double matchScore = matchingEngine.calculateCompatibility(activePref, candPref, mismatches);

            // Filter based on the configured matching threshold
            if (matchScore >= matchingThreshold) {
                StudentProfile candProfile = studentProfileRepository.findById(candPref.getUserId())
                        .orElse(null);
                
                if (candProfile != null) {
                    Map<String, String> matches = new HashMap<>();
                    matches.put("smoking", candPref.getSmoking() == 0 ? "Non-smoker" : "Smoker");
                    matches.put("sleepSchedule", candPref.getSleepSchedule() == 0 ? "Early Bird" : "Night Owl");
                    matches.put("cleanliness", candPref.getCleanliness() == 5 ? "High Cleanliness" : (candPref.getCleanliness() == 3 ? "Moderate Cleanliness" : "Low Cleanliness"));

                    Map<String, Double> breakdown = matchingEngine.calculateCompatibilityBreakdown(activePref, candPref);

                    suggestions.add(MatchingResponse.builder()
                            .studentId(candPref.getUserId())
                            .fullName(candProfile.getFullName())
                            .collegeName(candProfile.getCollege() != null ? candProfile.getCollege().getName() : "Unspecified College")
                            .gender(candProfile.getGender())
                            .hometownDistrict(candProfile.getHometownDistrict())
                            .matchScorePercentage(matchScore)
                            .matchingPreferences(matches)
                            .mismatchedPreferences(mismatches)
                            .majorCourse(candProfile.getMajorCourse())
                            .academicYear(candProfile.getAcademicYear())
                            .budgetMin(candProfile.getBudgetMin() != null ? candProfile.getBudgetMin().doubleValue() : null)
                            .budgetMax(candProfile.getBudgetMax() != null ? candProfile.getBudgetMax().doubleValue() : null)
                            .bio(candProfile.getBio())
                            .avatarUrl(candProfile.getAvatarUrl())
                            .interests(candProfile.getInterests())
                            .compatibilityBreakdown(breakdown)
                            .build());
                }
            }
        }

        // Sort descending by score
        suggestions.sort((a, b) -> Double.compare(b.getMatchScorePercentage(), a.getMatchScorePercentage()));
        return suggestions;
    }

    @Transactional(readOnly = true)
    public MatchingResponse getCompatibility(UUID userId, UUID targetUserId) {
        StudentProfile activeProfile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not setup yet"));

        RoommatePreference activePref = roommatePreferenceRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Please complete the Roommate Quiz first"));

        RoommatePreference candPref = roommatePreferenceRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user has not completed the roommate quiz yet"));

        StudentProfile candProfile = studentProfileRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user profile not found"));

        Map<String, String> mismatches = new HashMap<>();
        double matchScore = matchingEngine.calculateCompatibility(activePref, candPref, mismatches);

        Map<String, String> matches = new HashMap<>();
        matches.put("smoking", candPref.getSmoking() == 0 ? "Non-smoker" : "Smoker");
        matches.put("sleepSchedule", candPref.getSleepSchedule() == 0 ? "Early Bird" : "Night Owl");
        matches.put("cleanliness", candPref.getCleanliness() == 5 ? "High Cleanliness" : (candPref.getCleanliness() == 3 ? "Moderate Cleanliness" : "Low Cleanliness"));

        Map<String, Double> breakdown = matchingEngine.calculateCompatibilityBreakdown(activePref, candPref);

        return MatchingResponse.builder()
                .studentId(targetUserId)
                .fullName(candProfile.getFullName())
                .collegeName(candProfile.getCollege() != null ? candProfile.getCollege().getName() : "Unspecified College")
                .gender(candProfile.getGender())
                .hometownDistrict(candProfile.getHometownDistrict())
                .matchScorePercentage(matchScore)
                .matchingPreferences(matches)
                .mismatchedPreferences(mismatches)
                .majorCourse(candProfile.getMajorCourse())
                .academicYear(candProfile.getAcademicYear())
                .budgetMin(candProfile.getBudgetMin() != null ? candProfile.getBudgetMin().doubleValue() : null)
                .budgetMax(candProfile.getBudgetMax() != null ? candProfile.getBudgetMax().doubleValue() : null)
                .bio(candProfile.getBio())
                .avatarUrl(candProfile.getAvatarUrl())
                .interests(candProfile.getInterests())
                .compatibilityBreakdown(breakdown)
                .build();
    }
}
