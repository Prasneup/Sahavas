package com.unisphere.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class RoommateActionRequest {
    private UUID targetUserId;
    private String actionType; // PASS, SAVE, INTERESTED
}
