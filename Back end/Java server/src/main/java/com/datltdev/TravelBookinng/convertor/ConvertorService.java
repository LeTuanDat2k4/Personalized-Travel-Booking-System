package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.Booking;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ConvertorService {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private UserConvertor userConvertor;

    @Autowired
    private AccommodationConvertor accommodationConvertor;

    @Autowired
    private BookingConvertor bookingConvertor;

    public BookingDTO mapBookingEntityToBookingDTOPlusBookedRooms(Booking booking, boolean mapUser) {

        BookingDTO bookingDTO = bookingConvertor.convertToBookingDTO(booking);
        bookingDTO.setTotalPrice(booking.getTotalPrice());
        if (!mapUser) {
            bookingDTO.setUser(null);
        }
        if (booking.getAccommodation() != null) {
            AccommodationDTO propertyDTO = accommodationConvertor.convertToAccommodationDTO(booking.getAccommodation());
            bookingDTO.setAccommodation(propertyDTO);
        }
        return bookingDTO;
    }

    public UserDTO convertToUserDTOPlusBookingsAndRoom(UserEntity user) {
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setAccommodations(null);
        if (!user.getBookings().isEmpty()) {
            userDTO.setBookings(user.getBookings().stream().map(booking -> mapBookingEntityToBookingDTOPlusBookedRooms(booking, false)).collect(Collectors.toList()));
        }
        return userDTO;
    }

    public AccommodationDTO convertToPropertyDTOPlusBookings(Accommodation accommodation) {
        AccommodationDTO propertyResponse = accommodationConvertor.convertToAccommodationDTO(accommodation);
        if (accommodation.getBookings() != null) {
            propertyResponse.setBookings(accommodation.getBookings().stream().map(bookingConvertor::convertToBookingDTO).collect(Collectors.toList()));
        }
        return propertyResponse;
    }

    public List<UserDTO> mapUserListEntityToUserListDTO(List<UserEntity> userList) {
        return userList.stream().map(userConvertor::convertToUserDTO).collect(Collectors.toList());
    }

    public List<BookingDTO> mapBookingListEntityToBookingListDTO(List<Booking> bookingList) {
        return bookingList.stream().map(bookingConvertor::convertToBookingDTO).collect(Collectors.toList());
    }

    public List<AccommodationDTO> mapPropertyListEntityToPropertyListDTO(List<Accommodation> roomList) {
        return roomList.stream().map(accommodationConvertor::convertToAccommodationDTO).collect(Collectors.toList());
    }

}
