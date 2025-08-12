package com.datltdev.TravelBookinng.model.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AccommodationResponse {
    private Long id;
    private String title;
    private String description;
    private String bookingConfirmationCode;
    private String type;
    private Double price;
    private String location;
    private Double latitude;
    private Double longitude;
    private String photoUrl;
    private List<BookingResponse> bookings;
}
