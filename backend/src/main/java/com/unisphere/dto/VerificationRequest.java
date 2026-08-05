package com.unisphere.dto;

import lombok.Data;

@Data
public class VerificationRequest {
    private String documentType; // CITIZENSHIP, STUDENT_ID, ADMISSION_RECEIPT
    private String registrationNumber;
    private String imageUrl;
}
