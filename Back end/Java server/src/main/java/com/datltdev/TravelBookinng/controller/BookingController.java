package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping("/book-room/{propertyId}/{userId}")
//    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<ResponseDTO> saveBookings(@PathVariable Long propertyId,
                                                    @PathVariable Long userId,
                                                    @RequestBody BookingDTO bookingRequest) {

        if (propertyId == null || propertyId <= 0 || userId == null || userId <= 0 ||
                bookingRequest.getCheckInDate() == null || bookingRequest.getCheckOutDate() == null) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Please provide valid property ID, user ID, check-in date, and check-out date");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        if (bookingRequest.getCheckInDate().isAfter(bookingRequest.getCheckOutDate())) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Check-in date must be before check-out date");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }

        ResponseDTO response = bookingService.saveBooking(propertyId, userId, bookingRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);

    }

    @GetMapping("/all")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> getAllBookings() {
        ResponseDTO response = bookingService.getAllBookings();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-by-confirmation-code/{confirmationCode}")
    public ResponseEntity<ResponseDTO> getBookingByConfirmationCode(@PathVariable String confirmationCode) {
        if (confirmationCode == null || confirmationCode.isBlank()) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Confirmation code is required");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = bookingService.findBookingByConfirmationCode(confirmationCode);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/cancel/{bookingId}")
//    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<ResponseDTO> cancelBooking(@PathVariable Long bookingId) {
        if (bookingId == null || bookingId <= 0) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid booking ID");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
