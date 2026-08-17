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
import java.util.HashMap;
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

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Listing> all = listingRepository.findAll();
        
        long totalListings = all.size();
        
        double avgRent = all.stream()
                .mapToDouble(l -> l.getRentAmount().doubleValue())
                .average()
                .orElse(0.0);
                
        long activeThisWeek = all.stream()
                .filter(l -> l.getCreatedAt() != null && l.getCreatedAt().isAfter(java.time.ZonedDateTime.now().minusDays(7)))
                .count();
                
        long rentedThisMonth = all.stream()
                .filter(l -> l.getIsAvailable() != null && !l.getIsAvailable())
                .count();
                
        long totalShortlists = savedRoomRepository.count();
        
        // Find popular neighborhood
        Map<String, Long> neighborhoodCounts = new HashMap<>();
        for (Listing l : all) {
            String text = l.getDistanceFromCollegeText();
            if (text != null && !text.trim().isEmpty()) {
                String clean = text.toLowerCase();
                String neighborhood = null;
                if (clean.contains("balkumari")) neighborhood = "Balkumari, Lalitpur";
                else if (clean.contains("pulchowk")) neighborhood = "Pulchowk, Lalitpur";
                else if (clean.contains("kalimati")) neighborhood = "Kalimati, Kathmandu";
                else if (clean.contains("patan")) neighborhood = "Patan, Lalitpur";
                else if (clean.contains("dhobighat")) neighborhood = "Dhobighat, Lalitpur";
                else if (clean.contains("kirtipur")) neighborhood = "Kirtipur, Kathmandu";
                else if (clean.contains("gwarko")) neighborhood = "Gwarko, Lalitpur";
                else if (clean.contains("baneshwor")) neighborhood = "Baneshwor, Kathmandu";
                else if (clean.contains("chabahil")) neighborhood = "Chabahil, Kathmandu";
                else if (clean.contains("koteshwor")) neighborhood = "Koteshwor, Kathmandu";
                else if (clean.contains("lagankhel")) neighborhood = "Lagankhel, Lalitpur";
                else if (clean.contains("kupandole")) neighborhood = "Kupandole, Lalitpur";
                else if (clean.contains("imadol")) neighborhood = "Imadol, Lalitpur";
                
                if (neighborhood != null) {
                    neighborhoodCounts.put(neighborhood, neighborhoodCounts.getOrDefault(neighborhood, 0L) + 1);
                }
            }
        }
        
        String popularNeighborhood = neighborhoodCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("No data available");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRent", Math.round(avgRent));
        stats.put("totalListings", totalListings);
        stats.put("activeThisWeek", activeThisWeek);
        stats.put("rentedThisMonth", rentedThisMonth);
        stats.put("totalShortlists", totalShortlists);
        stats.put("popularNeighborhood", popularNeighborhood);
        
        return ResponseEntity.ok(stats);
    }

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
