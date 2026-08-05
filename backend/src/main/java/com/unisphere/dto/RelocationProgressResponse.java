package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelocationProgressResponse {
    private boolean admissionCompleted;
    private boolean collegeConfirmed;
    private boolean roomFound;
    private boolean roommateFound;
    private boolean internetSetup;
    private boolean transportationSetup;
    private int streakDays;
    private int totalXp;
    private List<String> unlockedBadges;
    private int completionPercentage;
}
