package com.datltdev.TravelBookinng.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewDTO {
    private Long reviewId;
    private Long userId;
    private String username; // Chỉ cần ID của user
    private Long accommodationId; // Chỉ cần ID của accommodation
    private Float rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
