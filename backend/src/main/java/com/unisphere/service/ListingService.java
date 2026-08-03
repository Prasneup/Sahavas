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
        listing.setOwner(owner);
        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public List<Listing> getNear(double lat, double lng, double distanceMeters) {
        try {
            return listingRepository.findListingsNear(lat, lng, distanceMeters);
        } catch (Exception e) {
            log.warn("PostGIS spatial query failed (H2 database in use). Falling back to in-memory Haversine distance calculations.");
            return listingRepository.findAll().stream()
                    .filter(l -> calculateDistance(lat, lng, l.getLocationLat(), l.getLocationLng()) <= distanceMeters)
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<Listing> getAll() {
        return listingRepository.findAll();
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
