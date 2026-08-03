package com.unisphere.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private UUID id;
    private String fullName;
    private String gender;
    private Integer age;
    private String collegeName;
    private String majorCourse;
    private Integer academicYear;
    private Integer currentSemester;
    private String avatarUrl;
    private String bio;
    private String hometownDistrict;
    private String currentCity;
    private String preferredRelocationCity;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String verificationStatus;
    private Integer completenessPercentage;
    private List<String> interests;
    private List<String> skills;
    private List<String> languages;
}
