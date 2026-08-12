package com.unisphere.controller;

import com.unisphere.model.*;
import com.unisphere.repository.*;
import com.unisphere.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ListingRepository listingRepository;
    private final TrustReportRepository trustReportRepository;
    private final TrustService trustService;

    // 1. Verifications list & review
    @GetMapping("/verifications")
    public ResponseEntity<List<StudentProfile>> getPendingVerifications() {
        return ResponseEntity.ok(studentProfileRepository.findAllByVerificationStatus("PENDING_VERIFICATION"));
    }

    @PostMapping("/verifications/{id}/review")
    public ResponseEntity<?> reviewVerification(
            @PathVariable("id") UUID profileId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status"); // VERIFIED or REJECTED
        StudentProfile profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        profile.setVerificationStatus(status);
        if ("VERIFIED".equalsIgnoreCase(status)) {
            profile.setVerificationLevel(VerificationLevel.COLLEGE_VERIFIED);
        } else {
            profile.setVerificationLevel(VerificationLevel.UNVERIFIED);
        }

        studentProfileRepository.save(profile);
        trustService.calculateTrustScore(profileId);

        return ResponseEntity.ok(Map.of("message", "Verification status updated successfully"));
    }

    // 2. Listings moderation
    @GetMapping("/listings")
    public ResponseEntity<List<Listing>> getAllListings() {
        return ResponseEntity.ok(listingRepository.findAll());
    }

    @PostMapping("/listings/{id}/review")
    public ResponseEntity<?> reviewListing(
            @PathVariable("id") UUID listingId,
            @RequestBody Map<String, Boolean> body) {

        Boolean verify = body.get("verified");
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        listing.setIsVerified(verify);
        listingRepository.save(listing);

        return ResponseEntity.ok(Map.of("message", "Listing verification updated successfully"));
    }

    // 3. Fraud/Trust Reports
    @GetMapping("/reports")
    public ResponseEntity<List<TrustReport>> getReports() {
        return ResponseEntity.ok(trustReportRepository.findAll());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable("id") UUID reportId) {
        TrustReport report = trustReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        report.setStatus(TrustReport.ReportStatus.RESOLVED);
        trustReportRepository.save(report);

        // Recalculate reported user trust score (removes active penalty)
        trustService.calculateTrustScore(report.getReportedUserId());

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
            @RequestBody Map<String, String> body) {

        String status = body.get("status"); // VERIFIED, SUSPENDED, PENDING_VERIFICATION
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setStatus(status);
        userRepository.save(user);

        StudentProfile profile = studentProfileRepository.findById(userId).orElse(null);
        if (profile != null) {
            profile.setVerificationStatus(status);
            studentProfileRepository.save(profile);
        }

        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    // 5. System Analytics Counts
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("verifiedUsers", studentProfileRepository.countByVerificationStatus("VERIFIED"));
        stats.put("totalListings", listingRepository.count());
        stats.put("activeReports", trustReportRepository.countByStatus(TrustReport.ReportStatus.PENDING));

        // Suspicious listings count (AI moderation indicator)
        long suspiciousCount = listingRepository.findAll().stream()
                .filter(l -> trustService.isSuspiciousListing(l))
                .count();
        stats.put("suspiciousListings", suspiciousCount);

        return ResponseEntity.ok(stats);
    }
}
