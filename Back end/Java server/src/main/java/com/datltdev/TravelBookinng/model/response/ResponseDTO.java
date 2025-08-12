package com.datltdev.TravelBookinng.model.response;

import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseDTO {
    private Object data;
    private Integer statusCode;
    private String message;
    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode;
    private UserDTO user;
    private AccommodationDTO accommodation;
    private BookingDTO booking;
    private List<UserDTO> userList;
    private List<AccommodationDTO> accommodationList;
    private List<BookingDTO> bookingList;
}
