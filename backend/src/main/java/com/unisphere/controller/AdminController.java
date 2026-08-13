package com.unisphere.controller;

import com.unisphere.model.*;
import com.unisphere.repository.*;
import com.unisphere.service.EmailService;
import com.unisphere.service.TrustService;
import com.unisphere.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ListingRepository listingRepository;
    private final TrustReportRepository trustReportRepository;
    private final TrustService trustService;
    private final VerificationSubmissionRepository verificationSubmissionRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final EmailService emailService;

    // 1. Verifications list & review
    @GetMapping("/verifications")
    public ResponseEntity<List<Map<String, Object>>> getPendingVerifications() {
        List<VerificationSubmission> list = verificationSubmissionRepository.findAllByStatusOrderBySubmittedAtAsc("PENDING");
        List<Map<String, Object>> result = new ArrayList<>();
        for (VerificationSubmission sub : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sub.getId());
            map.put("userId", sub.getUserId());
            map.put("documentType", sub.getDocumentType());
            map.put("registrationNumber", sub.getRegistrationNumber());
            map.put("documentImageUrl", sub.getDocumentImageUrl());
            map.put("status", sub.getStatus());
            map.put("ocrName", sub.getOcrName());
            map.put("ocrSimilarity", sub.getOcrSimilarity());
            map.put("submittedAt", sub.getSubmittedAt());
            
            User user = userRepository.findById(sub.getUserId()).orElse(null);
            StudentProfile profile = studentProfileRepository.findById(sub.getUserId()).orElse(null);
            if (user != null) {
                map.put("phoneNumber", user.getPhoneNumber());
                map.put("email", user.getEmail());
                map.put("role", user.getRole());
            }
            if (profile != null) {
                map.put("fullName", profile.getFullName());
                map.put("collegeName", profile.getCollege() != null ? profile.getCollege().getName() : "Sahavas Partner Owner");
                map.put("currentCity", profile.getCurrentCity());
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verifications/{id}/review")
    public ResponseEntity<?> reviewVerification(
            @PathVariable("id") UUID submissionId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @RequestBody Map<String, String> body) {

        String status = body.get("status"); // APPROVED, REJECTED, CORRECTION_REQUIRED, SUSPENDED
        String reason = body.get("reason"); // explanation for rejection or correction

        VerificationSubmission submission = verificationSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        UUID userId = submission.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        StudentProfile profile = studentProfileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        String previousStatus = user.getStatus();

        submission.setStatus(status);
        submission.setRejectionReason(reason);
        submission.setReviewedAt(ZonedDateTime.now());
        submission.setReviewedBy(adminPrincipal.getId());
        verificationSubmissionRepository.save(submission);

        if ("APPROVED".equalsIgnoreCase(status)) {
            user.setStatus("verified");
            profile.setVerificationStatus("VERIFIED");
            if ("owner".equals(user.getRole())) {
                profile.setVerificationLevel(VerificationLevel.PREMIUM_VERIFIED);
            } else {
                profile.setVerificationLevel(VerificationLevel.COLLEGE_VERIFIED);
            }
            profile.setTrustScore(100);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            user.setStatus("pending_verification");
            profile.setVerificationStatus("REJECTED");
            profile.setVerificationLevel(VerificationLevel.UNVERIFIED);
            profile.setTrustScore(10);
        } else if ("CORRECTION_REQUIRED".equalsIgnoreCase(status)) {
            user.setStatus("pending_verification");
            profile.setVerificationStatus("CORRECTION_REQUIRED");
            profile.setVerificationLevel(VerificationLevel.UNVERIFIED);
        } else if ("SUSPENDED".equalsIgnoreCase(status)) {
            user.setStatus("suspended");
            profile.setVerificationStatus("SUSPENDED");
            profile.setVerificationLevel(VerificationLevel.UNVERIFIED);
            profile.setTrustScore(0);
        }

        userRepository.save(user);
        studentProfileRepository.save(profile);

        // Record Audit Log
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .adminId(adminPrincipal.getId())
                .affectedUserId(userId)
                .action("REVIEW_USER_VERIFICATION")
                .reason(reason)
                .previousStatus(previousStatus)
                .newStatus(status)
                .build();
        adminAuditLogRepository.save(auditLog);

        // Send Email Notice
        emailService.sendVerificationStatusEmail(user.getEmail(), profile.getFullName(), status, reason);

        return ResponseEntity.ok(Map.of("message", "User verification reviewed successfully"));
    }

    // 2. Listings moderation
    @GetMapping("/listings")
    public ResponseEntity<List<Listing>> getAllListings() {
        return ResponseEntity.ok(listingRepository.findAll());
    }

    @PostMapping("/listings/{id}/review")
    public ResponseEntity<?> reviewListing(
            @PathVariable("id") UUID listingId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @RequestBody Map<String, Object> body) {

        String status = (String) body.get("status"); // APPROVED, REJECTED, CORRECTION_REQUIRED, SUSPENDED
        String reason = (String) body.get("reason");

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        String previousStatus = listing.getVerificationStatus();

        listing.setVerificationStatus(status);
        listing.setRejectionReason(reason);
        if ("APPROVED".equalsIgnoreCase(status)) {
            listing.setIsVerified(true);
        } else {
            listing.setIsVerified(false);
        }
        listingRepository.save(listing);

        // Record Audit Log
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .adminId(adminPrincipal.getId())
                .affectedListingId(listingId)
                .action("REVIEW_LISTING")
                .reason(reason)
                .previousStatus(previousStatus)
                .newStatus(status)
                .build();
        adminAuditLogRepository.save(auditLog);

        // Get listing owner user & profile details
        User owner = listing.getOwner();
        StudentProfile profile = studentProfileRepository.findById(owner.getId()).orElse(null);
        String ownerName = profile != null ? profile.getFullName() : "Landlord";

        // Send Email Notice to Owner
        emailService.sendVerificationStatusEmail(owner.getEmail(), ownerName, "LISTING_" + status, "Listing Title: " + listing.getTitle() + "\nFeedback: " + reason);

        return ResponseEntity.ok(Map.of("message", "Listing verification updated successfully"));
    }

    // 3. Fraud/Trust Reports
    @GetMapping("/reports")
    public ResponseEntity<List<TrustReport>> getReports() {
        return ResponseEntity.ok(trustReportRepository.findAll());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(
            @PathVariable("id") UUID reportId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal) {
        
        TrustReport report = trustReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        report.setStatus(TrustReport.ReportStatus.RESOLVED);
        trustReportRepository.save(report);

        // Recalculate reported user trust score (removes active penalty)
        trustService.calculateTrustScore(report.getReportedUserId());

        // Record Audit Log
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .adminId(adminPrincipal.getId())
                .affectedUserId(report.getReportedUserId())
                .action("RESOLVE_REPORT")
                .reason("Report resolved by administrator")
                .previousStatus("PENDING")
                .newStatus("RESOLVED")
                .build();
        adminAuditLogRepository.save(auditLog);

        return ResponseEntity.ok(Map.of("message", "Report marked as resolved"));
    }

    // 4. User management
    @GetMapping("/users")
    public ResponseEntity<List<StudentProfile>> getAllUsers() {
        return ResponseEntity.ok(studentProfileRepository.findAll());
    }

    @PostMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable("id") UUID userId,
            @AuthenticationPrincipal UserPrincipal adminPrincipal,
            @RequestBody Map<String, String> body) {

        String status = body.get("status"); // VERIFIED, SUSPENDED, PENDING_VERIFICATION
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String previousStatus = user.getStatus();
        user.setStatus(status.toLowerCase());
        userRepository.save(user);

        StudentProfile profile = studentProfileRepository.findById(userId).orElse(null);
        if (profile != null) {
            profile.setVerificationStatus(status.toUpperCase());
            if ("verified".equalsIgnoreCase(status)) {
                profile.setVerificationLevel(VerificationLevel.COLLEGE_VERIFIED);
                profile.setTrustScore(100);
            } else if ("suspended".equalsIgnoreCase(status)) {
                profile.setVerificationLevel(VerificationLevel.UNVERIFIED);
                profile.setTrustScore(0);
            }
            studentProfileRepository.save(profile);
        }

        // Record Audit Log
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .adminId(adminPrincipal.getId())
                .affectedUserId(userId)
                .action("UPDATE_USER_STATUS")
                .reason("Manual status override")
                .previousStatus(previousStatus)
                .newStatus(status)
                .build();
        adminAuditLogRepository.save(auditLog);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    // 5. Admin Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        List<AdminAuditLog> logs = adminAuditLogRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (AdminAuditLog logEntry : logs) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", logEntry.getId());
            map.put("adminId", logEntry.getAdminId());
            map.put("affectedUserId", logEntry.getAffectedUserId());
            map.put("affectedListingId", logEntry.getAffectedListingId());
            map.put("action", logEntry.getAction());
            map.put("reason", logEntry.getReason());
            map.put("previousStatus", logEntry.getPreviousStatus());
            map.put("newStatus", logEntry.getNewStatus());
            map.put("createdAt", logEntry.getCreatedAt());

            StudentProfile adminProfile = studentProfileRepository.findById(logEntry.getAdminId()).orElse(null);
            map.put("adminName", adminProfile != null ? adminProfile.getFullName() : "Admin");

            if (logEntry.getAffectedUserId() != null) {
                StudentProfile userProfile = studentProfileRepository.findById(logEntry.getAffectedUserId()).orElse(null);
                map.put("affectedUserName", userProfile != null ? userProfile.getFullName() : "User");
            }

            if (logEntry.getAffectedListingId() != null) {
                Listing listing = listingRepository.findById(logEntry.getAffectedListingId()).orElse(null);
                map.put("affectedListingTitle", listing != null ? listing.getTitle() : "Listing");
            }
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // 6. System Analytics Counts
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("verifiedUsers", studentProfileRepository.countByVerificationStatus("VERIFIED"));
        stats.put("totalListings", listingRepository.count());
        stats.put("activeReports", trustReportRepository.countByStatus(TrustReport.ReportStatus.PENDING));

        long suspiciousCount = listingRepository.findAll().stream()
                .filter(trustService::isSuspiciousListing)
                .count();
        stats.put("suspiciousListings", suspiciousCount);

        return ResponseEntity.ok(stats);
    }
}
