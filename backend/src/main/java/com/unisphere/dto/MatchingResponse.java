package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingResponse {
    private UUID studentId;
    private String fullName;
    private String collegeName;
    private String gender;
    private String hometownDistrict;
    private double matchScorePercentage;
    private Map<String, String> matchingPreferences;
    private Map<String, String> mismatchedPreferences;
    private String majorCourse;
    private Integer academicYear;
    private Double budgetMin;
    private Double budgetMax;
    private String bio;
    private String avatarUrl;
    private java.util.List<String> interests;
    private Map<String, Double> compatibilityBreakdown;
}
