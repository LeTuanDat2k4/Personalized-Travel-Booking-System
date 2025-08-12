package com.datltdev.TravelBookinng.model.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AccommodationRequest {
    private String type;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numOfChildren;
    private Integer numOfAdults;
    
}
