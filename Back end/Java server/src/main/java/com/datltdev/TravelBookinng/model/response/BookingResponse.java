package com.datltdev.TravelBookinng.model.response;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BookingResponse {
    private Long id;
    private LocalDate checkInDate;
    @NotNull(message = "check in date is required")
    private LocalDate checkOutDate;
    @Min(value = 1, message = "Number of adults must not be less than 1")
    private Integer numOfAdults;
    @Min(value = 0, message = "Number of children must not be less than 0")
    private Integer numOfChildren;
    private Integer totalOfGuest;
    private String bookingConfirmationCode;
}
