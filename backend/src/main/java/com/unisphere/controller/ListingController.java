package com.unisphere.controller;

import com.unisphere.model.Listing;
import com.unisphere.model.SavedRoom;
import com.unisphere.repository.ListingRepository;
import com.unisphere.repository.SavedRoomRepository;
import com.unisphere.security.UserPrincipal;
import com.unisphere.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Slf4j
public class ListingController {

    private final ListingService listingService;
    private final SavedRoomRepository savedRoomRepository;
    private final ListingRepository listingRepository;

    @PostMapping
    public ResponseEntity<Listing> createListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody Listing listing) {
        Listing created = listingService.createListing(principal.getId(), listing);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Listing>> getListings(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "5000") Double distance) {
        
        if (lat != null && lng != null) {
            return ResponseEntity.ok(listingService.getNear(lat, lng, distance));
        }
        return ResponseEntity.ok(listingService.getAll());
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<?> saveListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID listingId) {
        
        UUID userId = principal.getId();
        if (savedRoomRepository.existsByUserIdAndListingId(userId, listingId)) {
            return ResponseEntity.ok(Map.of("message", "Listing already saved"));
        }

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        SavedRoom savedRoom = SavedRoom.builder()
                .userId(userId)
                .listing(listing)
                .build();
        savedRoomRepository.save(savedRoom);

        return ResponseEntity.ok(Map.of("message", "Listing saved successfully"));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsaveListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID listingId) {

        UUID userId = principal.getId();
        var opt = savedRoomRepository.findByUserIdAndListingId(userId, listingId);
        if (opt.isPresent()) {
            savedRoomRepository.delete(opt.get());
        }

        return ResponseEntity.ok(Map.of("message", "Listing removed from saved rooms"));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<Listing>> getSavedListings(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getId();
        List<Listing> saved = savedRoomRepository.findAllByUserId(userId).stream()
                .map(SavedRoom::getListing)
                .collect(Collectors.toList());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> getListingById(@PathVariable("id") UUID id) {
        log.info("Received request for listing ID: {}", id);
        Listing listing = listingService.getById(id);
        log.info("Listing search result for ID {}: {}", id, listing != null ? "Found" : "Not Found");
        log.info("Returning API response for listing ID {}: {}", id, listing);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(listing);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Listing>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        UUID ownerId = principal.getId();
        return ResponseEntity.ok(listingService.getByOwnerId(ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Listing> updateListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id,
            @Valid @RequestBody Listing listingDetails) {
        Listing updated = listingService.updateListing(principal.getId(), id, listingDetails);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id) {
        listingService.deleteListing(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
    }
}
