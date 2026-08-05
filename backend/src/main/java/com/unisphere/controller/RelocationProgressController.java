package com.unisphere.controller;

import com.unisphere.dto.RelocationProgressResponse;
import com.unisphere.model.RelocationProgress;
import com.unisphere.repository.RelocationProgressRepository;
import com.unisphere.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/relocation")
@RequiredArgsConstructor
public class RelocationProgressController {

    private final RelocationProgressRepository relocationProgressRepository;

    @GetMapping("/progress")
    public ResponseEntity<RelocationProgressResponse> getProgress(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getId();
        RelocationProgress progress = getOrCreateProgress(userId);
        return ResponseEntity.ok(mapToResponse(progress));
    }

    @PostMapping("/progress/toggle")
    public ResponseEntity<RelocationProgressResponse> toggleTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {

        UUID userId = principal.getId();
        String taskName = (String) body.get("taskName");
        boolean completed = (boolean) body.get("completed");

        RelocationProgress progress = getOrCreateProgress(userId);

        boolean wasCompleted = false;
        switch (taskName) {
            case "admissionCompleted":
                wasCompleted = progress.isAdmissionCompleted();
                progress.setAdmissionCompleted(completed);
                break;
            case "collegeConfirmed":
                wasCompleted = progress.isCollegeConfirmed();
                progress.setCollegeConfirmed(completed);
                break;
            case "roomFound":
                wasCompleted = progress.isRoomFound();
                progress.setRoomFound(completed);
                break;
            case "roommateFound":
                wasCompleted = progress.isRoommateFound();
                progress.setRoommateFound(completed);
                break;
            case "internetSetup":
                wasCompleted = progress.isInternetSetup();
                progress.setInternetSetup(completed);
                break;
            case "transportationSetup":
                wasCompleted = progress.isTransportationSetup();
                progress.setTransportationSetup(completed);
                break;
            default:
                throw new IllegalArgumentException("Unknown task name: " + taskName);
        }

        // Award 100 XP on new completion
        if (completed && !wasCompleted) {
            progress.setTotalXp(progress.getTotalXp() + 100);
        } else if (!completed && wasCompleted) {
            progress.setTotalXp(Math.max(0, progress.getTotalXp() - 100));
        }

        // Evaluate achievements
        Set<String> badges = new HashSet<>();
        if (progress.getUnlockedBadges() != null && !progress.getUnlockedBadges().isBlank()) {
            badges.addAll(Arrays.asList(progress.getUnlockedBadges().split(",")));
        }

        // 1. Fresh Explorer
        if (completed) {
            badges.add("FRESH_MOVER");
        }

        // 2. First Roof
        if (progress.isRoomFound()) {
            badges.add("ROOF_FINDER");
        }

        // 3. Co-habitor
        if (progress.isRoommateFound()) {
            badges.add("CO_HABITOR");
        }

        // 4. Fully Set
        if (progress.isAdmissionCompleted() && progress.isCollegeConfirmed() && progress.isRoomFound()
                && progress.isRoommateFound() && progress.isInternetSetup() && progress.isTransportationSetup()) {
            badges.add("FULLY_SET");
        }

        progress.setUnlockedBadges(String.join(",", badges));
        relocationProgressRepository.save(progress);

        return ResponseEntity.ok(mapToResponse(progress));
    }

    private RelocationProgress getOrCreateProgress(UUID userId) {
        return relocationProgressRepository.findByUserId(userId)
                .orElseGet(() -> {
                    RelocationProgress rp = RelocationProgress.builder()
                            .userId(userId)
                            .admissionCompleted(false)
                            .collegeConfirmed(false)
                            .roomFound(false)
                            .roommateFound(false)
                            .internetSetup(false)
                            .transportationSetup(false)
                            .build();
                    return relocationProgressRepository.save(rp);
                });
    }

    private RelocationProgressResponse mapToResponse(RelocationProgress rp) {
        int completedCount = 0;
        if (rp.isAdmissionCompleted()) completedCount++;
        if (rp.isCollegeConfirmed()) completedCount++;
        if (rp.isRoomFound()) completedCount++;
        if (rp.isRoommateFound()) completedCount++;
        if (rp.isInternetSetup()) completedCount++;
        if (rp.isTransportationSetup()) completedCount++;

        int percentage = (int) Math.round((completedCount / 6.0) * 100.0);

        List<String> badgeList = new ArrayList<>();
        if (rp.getUnlockedBadges() != null && !rp.getUnlockedBadges().isBlank()) {
            badgeList.addAll(Arrays.asList(rp.getUnlockedBadges().split(",")));
        }

        return RelocationProgressResponse.builder()
                .admissionCompleted(rp.isAdmissionCompleted())
                .collegeConfirmed(rp.isCollegeConfirmed())
                .roomFound(rp.isRoomFound())
                .roommateFound(rp.isRoommateFound())
                .internetSetup(rp.isInternetSetup())
                .transportationSetup(rp.isTransportationSetup())
                .streakDays(rp.getStreakDays())
                .totalXp(rp.getTotalXp())
                .unlockedBadges(badgeList)
                .completionPercentage(percentage)
                .build();
    }
}
