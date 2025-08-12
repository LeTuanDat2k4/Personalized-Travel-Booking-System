package com.datltdev.TravelBookinng.model.dto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class AccommodationDTO {
    private Long accommodationId;
    private Long ownerId;
    private String name;
    private String description;
    private String type;
    private Double pricePerNight;
    private Boolean availability;
    private String location;
    private String reviewSummary;
    private Double averageRating;
    private Double latitude;
    private Double longitude;
    private String amenities;
    private List<ReviewDTO> reviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String bookingConfirmationCode;
    private List<BookingDTO> bookings;
    private String photoUrl;
}
