package com.unisphere.controller;

import com.unisphere.model.Listing;
import com.unisphere.security.UserPrincipal;
import com.unisphere.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

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
}
