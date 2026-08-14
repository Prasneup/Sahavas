package com.unisphere.service;

import com.unisphere.model.Listing;
import com.unisphere.model.User;
import com.unisphere.repository.ListingRepository;
import com.unisphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Listing createListing(UUID ownerId, Listing listing) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!"owner".equals(owner.getRole()) && !"admin".equals(owner.getRole())) {
            throw new IllegalStateException("Only house owners or landlords can create listings");
        }
        listing.setOwner(owner);
        listing.setVerificationStatus("PENDING");
        listing.setIsVerified(false);
        if (listing.getImages() != null) {
            for (int i = 0; i < listing.getImages().size(); i++) {
                var img = listing.getImages().get(i);
                img.setListing(listing);
                if (img.getIsPrimary() == null) {
                    img.setIsPrimary(i == 0);
                }
            }
        }
        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public List<Listing> getNear(double lat, double lng, double distanceMeters) {
        try {
            return listingRepository.findListingsNear(lat, lng, distanceMeters);
        } catch (Exception e) {
            log.warn("PostGIS spatial query failed (H2 database in use). Falling back to in-memory Haversine distance calculations.");
            return listingRepository.findAll().stream()
                    .filter(l -> "APPROVED".equals(l.getVerificationStatus()) && calculateDistance(lat, lng, l.getLocationLat(), l.getLocationLng()) <= distanceMeters)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<Listing> getAll() {
        return listingRepository.findAll().stream()
                .filter(l -> "APPROVED".equals(l.getVerificationStatus()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Listing getById(UUID id) {
        log.info("Querying database for listing by ID: {}", id);
        Listing listing = listingRepository.findById(id).orElse(null);
        log.info("Database query result for listing ID {}: {}", id, listing != null ? "Found" : "Not Found");
        return listing;
    }

    @Transactional(readOnly = true)
    public List<Listing> getByOwnerId(UUID ownerId) {
        return listingRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Listing updateListing(UUID ownerId, UUID listingId, Listing listingDetails) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!listing.getOwner().getId().equals(ownerId)) {
            throw new IllegalStateException("You are not authorized to update this listing");
        }

        listing.setTitle(listingDetails.getTitle());
        listing.setDescription(listingDetails.getDescription());
        listing.setRentAmount(listingDetails.getRentAmount());
        listing.setDepositAmount(listingDetails.getDepositAmount());
        listing.setLocationLat(listingDetails.getLocationLat());
        listing.setLocationLng(listingDetails.getLocationLng());
        listing.setRoomType(listingDetails.getRoomType());
        listing.setGenderPreference(listingDetails.getGenderPreference());
        listing.setDistanceFromCollegeText(listingDetails.getDistanceFromCollegeText());
        listing.setAmenities(listingDetails.getAmenities());
        listing.setIsAvailable(listingDetails.getIsAvailable());

        if (listingDetails.getImages() != null) {
            listing.getImages().clear();
            for (int i = 0; i < listingDetails.getImages().size(); i++) {
                var img = listingDetails.getImages().get(i);
                img.setListing(listing);
                if (img.getIsPrimary() == null) {
                    img.setIsPrimary(i == 0);
                }
                listing.getImages().add(img);
            }
        }

        return listingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(UUID ownerId, UUID listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!listing.getOwner().getId().equals(ownerId)) {
            throw new IllegalStateException("You are not authorized to delete this listing");
        }

        listingRepository.delete(listing);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
