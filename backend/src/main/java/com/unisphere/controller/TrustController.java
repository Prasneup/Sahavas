package com.unisphere.controller;

import com.unisphere.dto.VerificationRequest;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.TrustReport;
import com.unisphere.model.VerificationLevel;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.TrustReportRepository;
import com.unisphere.security.UserPrincipal;
import com.unisphere.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trust")
@RequiredArgsConstructor
public class TrustController {

    private final StudentProfileRepository studentProfileRepository;
    private final TrustReportRepository trustReportRepository;
    private final TrustService trustService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyTrust(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getId();
        
        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        // Recalculate score on read
        int score = trustService.calculateTrustScore(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("userId", userId);
        res.put("trustScore", score);
        res.put("verificationLevel", profile.getVerificationLevel().toString());
        res.put("collegeRegistrationNumber", profile.getCollegeRegistrationNumber());
        res.put("documentImageUrl", profile.getDocumentImageUrl());
        res.put("activeReportsCount", trustReportRepository.countByReportedUserIdAndStatus(userId, TrustReport.ReportStatus.PENDING));

        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody VerificationRequest request) {

        UUID userId = principal.getId();
        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        // Set college registration and verification tier
        profile.setCollegeRegistrationNumber(request.getRegistrationNumber());
        profile.setDocumentImageUrl(request.getImageUrl());
        
        // Auto transition to STUDENT_VERIFIED or COLLEGE_VERIFIED depending on document type
        if ("STUDENT_ID".equalsIgnoreCase(request.getDocumentType())) {
            profile.setVerificationLevel(VerificationLevel.COLLEGE_VERIFIED);
            profile.setVerificationStatus("VERIFIED");
        } else {
            profile.setVerificationLevel(VerificationLevel.STUDENT_VERIFIED);
            profile.setVerificationStatus("VERIFIED");
        }

        studentProfileRepository.save(profile);
        int newScore = trustService.calculateTrustScore(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("newVerificationLevel", profile.getVerificationLevel().toString());
        res.put("newTrustScore", newScore);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/report")
    public ResponseEntity<Map<String, Object>> submitReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {

        UUID reporterId = principal.getId();
        UUID reportedUserId = UUID.fromString(body.get("reportedUserId"));
        String reason = body.get("reason");
        String description = body.get("description");

        TrustReport report = TrustReport.builder()
                .reporterId(reporterId)
                .reportedUserId(reportedUserId)
                .reason(reason)
                .description(description)
                .build();

        trustReportRepository.save(report);

        // Recalculate target user's trust score to apply report penalty
        int newTargetScore = trustService.calculateTrustScore(reportedUserId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("reportId", report.getId());
        res.put("targetUserNewTrustScore", newTargetScore);

        return ResponseEntity.ok(res);
    }
}
