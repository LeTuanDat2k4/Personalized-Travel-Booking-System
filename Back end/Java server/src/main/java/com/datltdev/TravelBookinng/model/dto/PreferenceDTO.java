package com.datltdev.TravelBookinng.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PreferenceDTO {
    private Long preferenceId;
    private Long userId; // Chỉ cần ID của user
    private String preferenceType;
    private String value;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PreferenceDTO() {}
}
