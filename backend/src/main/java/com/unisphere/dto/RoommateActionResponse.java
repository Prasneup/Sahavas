package com.unisphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoommateActionResponse {
    private boolean mutualMatch;
    private ProfileResponse matchProfile;
}
