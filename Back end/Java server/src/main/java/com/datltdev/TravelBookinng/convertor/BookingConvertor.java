package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Booking;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BookingConvertor {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserConvertor userConvertor;
    @Autowired
    private AccommodationConvertor accommodationConvertor;

    public BookingDTO convertToBookingDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getBookingId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumOfAdults(booking.getNumOfAdults());
        dto.setNumOfChildren(booking.getNumOfChildren());
        dto.setTotalOfGuest(booking.getTotalOfGuest());
        dto.setBookingConfirmationCode(booking.getBookingConfirmationCode());
        // Chuyển đổi user (Entity -> DTO)
        if (booking.getUserEntity() != null) {
            UserDTO userDTO = userConvertor.convertToUserDTO(booking.getUserEntity());
            userDTO.setAccommodations(null);
            userDTO.setBookings(null);
            userDTO.setPreferences(null);
            dto.setUser(userDTO);
        }
        // Chuyển đổi property (Entity -> DTO)
        if (booking.getAccommodation() != null) {
            AccommodationDTO propertyDTO = accommodationConvertor.convertToAccommodationDTO(booking.getAccommodation());
            propertyDTO.setReviews(null);
            propertyDTO.setAmenities(null);
            propertyDTO.setBookings(null);
            dto.setAccommodation(propertyDTO);
        }
        return dto;
    }

    // Chuyển đổi từ BookingDTO -> BookingEntity
    public Booking convertToBookingEntity(BookingDTO bookingDTO) {
        Booking entity = new Booking();
        entity.setCheckInDate(bookingDTO.getCheckInDate());
        entity.setCheckOutDate(bookingDTO.getCheckOutDate());
        entity.setNumOfAdults(bookingDTO.getNumOfAdults());
        entity.setNumOfChildren(bookingDTO.getNumOfChildren());
        return entity;
    }
}
