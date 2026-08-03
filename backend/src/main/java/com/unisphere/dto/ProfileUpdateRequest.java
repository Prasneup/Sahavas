package com.unisphere.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String gender;
    private Integer age;
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
    private List<String> interests;
    private List<String> skills;
    private List<String> languages;
}
