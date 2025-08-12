package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;

public interface BookingService {
    ResponseDTO saveBooking(Long propertyId, Long userId, BookingDTO bookingRequest);

    ResponseDTO findBookingByConfirmationCode(String confirmationCode);

    ResponseDTO getAllBookings();

    ResponseDTO cancelBooking(Long bookingId);
}
