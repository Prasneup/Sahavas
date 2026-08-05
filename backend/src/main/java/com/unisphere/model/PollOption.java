package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "poll_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOption {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "option_text", nullable = false, length = 150)
    private String optionText;

    @Column(name = "votes_count", nullable = false)
    private int votesCount;

    @PrePersist
    protected void onCreate() {
        votesCount = 0;
    }
}
