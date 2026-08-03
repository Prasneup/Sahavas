package com.unisphere.service;

import com.unisphere.model.RoommatePreference;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class MatchingEngine {

    // Define weights
    private static final int W_SMOKING = 3;
    private static final int W_CLEANLINESS = 2;
    private static final int W_SLEEP = 2;
    private static final int W_BUDGET = 3;
    private static final int W_STUDY = 1;
    private static final int W_FOOD = 1;
    private static final int W_SOCIAL = 1;
    private static final int W_NOISE = 1;

    public double calculateCompatibility(RoommatePreference a, RoommatePreference b, 
                                         Map<String, String> mismatches) {
        double weightedSum = 0.0;
        double totalWeights = 0.0;

        // 1. Smoking (Hard constraint)
        double s_smoking = 1.0;
        if (a.getSmoking() == 0 && b.getSmoking() == 2) {
            // Non-smoker paired with active smoker is a dealbreaker (Similarity = 0)
            s_smoking = 0.0;
            mismatches.put("smoking", "User is strict non-smoker; Candidate is active smoker");
        } else {
            s_smoking = 1.0 - (Math.abs(a.getSmoking() - b.getSmoking()) / 2.0);
        }
        weightedSum += s_smoking * W_SMOKING;
        totalWeights += W_SMOKING;

        // 2. Cleanliness
        double s_clean = 1.0 - (Math.abs(a.getCleanliness() - b.getCleanliness()) / 2.0);
        if (s_clean < 0.5) {
            mismatches.put("cleanliness", "Differing neatness standards (" + getCleanLabel(a.getCleanliness()) + " vs " + getCleanLabel(b.getCleanliness()) + ")");
        }
        weightedSum += s_clean * W_CLEANLINESS;
        totalWeights += W_CLEANLINESS;

        // 3. Sleep Schedule
        double s_sleep = a.getSleepSchedule().equals(b.getSleepSchedule()) ? 1.0 : 0.0;
        if (s_sleep == 0.0) {
            mismatches.put("sleepSchedule", "Opposite schedules (" + getSleepLabel(a.getSleepSchedule()) + " vs " + getSleepLabel(b.getSleepSchedule()) + ")");
        }
        weightedSum += s_sleep * W_SLEEP;
        totalWeights += W_SLEEP;

        // 4. Budget Overlap
        double s_budget = 1.0;
        BigDecimal maxMin = a.getBudgetMin().max(b.getBudgetMin());
        BigDecimal minMax = a.getBudgetMax().min(b.getBudgetMax());
        if (maxMin.compareTo(minMax) > 0) {
            // Budget ranges do not overlap at all!
            s_budget = 0.0;
            mismatches.put("budget", "Budget ranges do not overlap");
        }
        weightedSum += s_budget * W_BUDGET;
        totalWeights += W_BUDGET;

        // 5. Study Habits
        double s_study = a.getStudyHabits().equals(b.getStudyHabits()) ? 1.0 : 0.5;
        weightedSum += s_study * W_STUDY;
        totalWeights += W_STUDY;

        // 6. Food Preference
        double s_food = 1.0;
        if (a.getFoodPreference() == 0 && b.getFoodPreference() == 1) {
            // Vegetarian vs Non-Veg
            s_food = 0.5;
        } else if (!a.getFoodPreference().equals(b.getFoodPreference())) {
            s_food = 0.8;
        }
        weightedSum += s_food * W_FOOD;
        totalWeights += W_FOOD;

        // 7. Social Level
        double s_social = 1.0 - (Math.abs(a.getSocialLevel() - b.getSocialLevel()) / 2.0);
        weightedSum += s_social * W_SOCIAL;
        totalWeights += W_SOCIAL;

        // 8. Noise Tolerance
        double s_noise = 1.0 - (Math.abs(a.getNoiseTolerance() - b.getNoiseTolerance()) / 2.0);
        weightedSum += s_noise * W_NOISE;
        totalWeights += W_NOISE;

        // Calculate weighted percentage
        double score = (weightedSum / totalWeights) * 100.0;
        // Round to 1 decimal place
        return Math.round(score * 10.0) / 10.0;
    }

    private String getSleepLabel(int val) {
        return val == 0 ? "Early Bird" : "Night Owl";
    }

    private String getCleanLabel(int val) {
        if (val == 0) return "Casual";
        if (val == 1) return "Moderate";
        return "Cleanliness Freak";
    }
}
