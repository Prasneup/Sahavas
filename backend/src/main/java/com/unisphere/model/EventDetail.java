package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDetail {
    @Id
    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "event_date", nullable = false)
    private OffsetDateTime eventDate;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(name = "rsvps_count", nullable = false)
    private int rsvpsCount;

    @PrePersist
    protected void onCreate() {
        rsvpsCount = 0;
    }
}
