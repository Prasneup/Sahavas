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

            // Filter out candidates with zero score (failed dealbreakers)
            if (matchScore > 0) {
                StudentProfile candProfile = studentProfileRepository.findById(candPref.getUserId())
                        .orElse(null);
                
                if (candProfile != null) {
                    Map<String, String> matches = new HashMap<>();
                    matches.put("smoking", candPref.getSmoking() == 0 ? "Non-smoker" : "Smoker");
                    matches.put("sleepSchedule", candPref.getSleepSchedule() == 0 ? "Early Bird" : "Night Owl");

                    suggestions.add(MatchingResponse.builder()
                            .studentId(candPref.getUserId())
                            .fullName(candProfile.getFullName())
                            .collegeName(candProfile.getCollege() != null ? candProfile.getCollege().getName() : "Unspecified College")
                            .gender(candProfile.getGender())
                            .hometownDistrict(candProfile.getHometownDistrict())
                            .matchScorePercentage(matchScore)
                            .matchingPreferences(matches)
                            .mismatchedPreferences(mismatches)
                            .build());
                }
            }
        }

        // Sort descending by score
        suggestions.sort((a, b) -> Double.compare(b.getMatchScorePercentage(), a.getMatchScorePercentage()));
        return suggestions;
    }
}
