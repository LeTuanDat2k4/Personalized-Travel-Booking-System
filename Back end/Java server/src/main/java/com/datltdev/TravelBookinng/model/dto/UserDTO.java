package com.datltdev.TravelBookinng.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String phoneNumber;
    private String role;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AccommodationDTO> accommodations; // Danh sách chỗ ở nếu là owner
    private List<BookingDTO> bookings; // Danh sách đặt chỗ nếu là traveler
    private List<PreferenceDTO> preferences; // Danh sách sở thích

    // Constructors
    public UserDTO() {}

}
