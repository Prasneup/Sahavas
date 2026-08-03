package com.unisphere.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoommateQuizRequest {

    @NotNull(message = "Smoking preference is required")
    @Min(0) @Max(2)
    private Integer smoking;

    @NotNull(message = "Drinking preference is required")
    @Min(0) @Max(2)
    private Integer drinking;

    @NotNull(message = "Sleep schedule preference is required")
    @Min(0) @Max(1)
    private Integer sleepSchedule;

    @NotNull(message = "Cleanliness preference is required")
    @Min(0) @Max(2)
    private Integer cleanliness;

    @NotNull(message = "Minimum budget is required")
    private BigDecimal budgetMin;

    @NotNull(message = "Maximum budget is required")
    private BigDecimal budgetMax;

    @NotNull(message = "Study habits is required")
    @Min(0) @Max(1)
    private Integer studyHabits;

    @NotNull(message = "Food preference is required")
    @Min(0) @Max(2)
    private Integer foodPreference;

    @NotNull(message = "Social level is required")
    @Min(0) @Max(2)
    private Integer socialLevel;

    @NotNull(message = "Noise tolerance is required")
    @Min(0) @Max(2)
    private Integer noiseTolerance;
}
