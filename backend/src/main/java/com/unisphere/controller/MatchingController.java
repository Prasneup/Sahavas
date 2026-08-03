package com.unisphere.controller;

import com.unisphere.dto.MatchingResponse;
import com.unisphere.dto.RoommateQuizRequest;
import com.unisphere.security.UserPrincipal;
import com.unisphere.service.MatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/preferences")
    public ResponseEntity<?> savePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoommateQuizRequest request) {
        matchingService.savePreferences(principal.getId(), request);
        return ResponseEntity.ok("Preferences saved successfully");
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<MatchingResponse>> getSuggestions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MatchingResponse> suggestions = matchingService.getSuggestions(principal.getId());
        return ResponseEntity.ok(suggestions);
    }
}
