package com.unisphere.service;

import com.unisphere.model.Listing;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.TrustReport;
import com.unisphere.model.VerificationLevel;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.TrustReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrustService {

    private final StudentProfileRepository studentProfileRepository;
    private final TrustReportRepository trustReportRepository;

    public int calculateTrustScore(UUID userId) {
        StudentProfile profile = studentProfileRepository.findById(userId).orElse(null);
        if (profile == null) return 10;

        int score = 10; // Default base

        // 1. Base Vetting Tiers
        VerificationLevel level = profile.getVerificationLevel();
        if (level != null) {
            switch (level) {
                case PHONE_VERIFIED:
                    score = 30;
                    break;
                case STUDENT_VERIFIED:
                    score = 60;
                    break;
                case COLLEGE_VERIFIED:
                    score = 85;
                    break;
                case PREMIUM_VERIFIED:
                    score = 100;
                    break;
                case UNVERIFIED:
                default:
                    score = 10;
                    break;
            }
        }

        // 2. Mock Ratings boost (+15% if student verified)
        if (level == VerificationLevel.COLLEGE_VERIFIED || level == VerificationLevel.PREMIUM_VERIFIED) {
            score += 10;
        }

        // 3. Penalty Deductions (-20% per active unresolved report)
        long activeReports = trustReportRepository.countByReportedUserIdAndStatus(userId, TrustReport.ReportStatus.PENDING);
        score -= (activeReports * 20);

        // Cap boundaries
        score = Math.max(0, Math.min(100, score));

        // Save updated score to profile
        profile.setTrustScore(score);
        studentProfileRepository.save(profile);

        return score;
    }

    public boolean isSuspiciousListing(Listing listing) {
        // Fraud Check: Outlier Room rent < NPR 4,000 (typical deposit scams in Lalitpur/Kathmandu)
        if (listing.getRentAmount() != null) {
            BigDecimal threshold = new BigDecimal("4000.0");
            if (listing.getRentAmount().compareTo(threshold) < 0) {
                return true;
            }
        }
        return false;
    }
}
