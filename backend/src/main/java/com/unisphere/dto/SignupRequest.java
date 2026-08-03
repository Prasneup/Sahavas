package com.unisphere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class SignupRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(98|97)\\d{8}$", message = "Invalid Nepalese mobile number prefix")
    private String phoneNumber;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String role; // ROLE_STUDENT, ROLE_LANDLORD

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Hometown district is required")
    private String hometownDistrict;

    @NotBlank(message = "Target city is required")
    private String currentCity;

    private UUID collegeId;
    private String majorCourse;
    private Integer academicYear;
}
