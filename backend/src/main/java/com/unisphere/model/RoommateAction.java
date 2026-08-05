package com.unisphere.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "roommate_actions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"actor_id", "target_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoommateAction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private User target;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 20, nullable = false)
    private ActionType actionType;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public enum ActionType {
        PASS,
        SAVE,
        INTERESTED
    }
}
