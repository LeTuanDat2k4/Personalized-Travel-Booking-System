package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.BookingConvertor;
import com.datltdev.TravelBookinng.convertor.ConvertorService;
import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.Booking;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.exception.MyException;
import com.datltdev.TravelBookinng.model.dto.BookingDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import com.datltdev.TravelBookinng.repository.BookingRepository;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.datltdev.TravelBookinng.service.BookingService;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private AccommodationRepository accommodationRepository;
    @Autowired
    private BookingConvertor bookingConvertor;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConvertorService convertorService;

    @Override
    public ResponseDTO saveBooking(Long propertyId, Long userId, BookingDTO bookingRequest) {
        ResponseDTO response = new ResponseDTO();

        try {
            if (bookingRequest.getCheckOutDate().isBefore(bookingRequest.getCheckInDate())) {
                throw new IllegalArgumentException("Check in date must come after check out date");
            }
            Accommodation accommodation = accommodationRepository.findById(propertyId).orElseThrow(() -> new MyException("Accommodation Not Found"));
            UserEntity user = userRepository.findById(userId).orElseThrow(() -> new MyException("UserEntity Not Found"));

            List<Booking> existingBookings = accommodation.getBookings();

            if (!propertyIsAvailable(bookingRequest, existingBookings)) {
                throw new MyException("Property not Available for selected date range");
            }
            Booking bookingEntity = bookingConvertor.convertToBookingEntity(bookingRequest);

            bookingEntity.setAccommodation(accommodation);
            bookingEntity.setUserEntity(user);
            String bookingConfirmationCode = SecurityUtils.generateRandomConfirmationCode(10);
            bookingEntity.setBookingConfirmationCode(bookingConfirmationCode);
            bookingEntity.setTotalPrice(bookingRequest.getTotalPrice());
            bookingRepository.save(bookingEntity);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingConfirmationCode(bookingConfirmationCode);

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Saving a booking: " + e.getMessage());

        }
        return response;
    }

    @Override
    public ResponseDTO findBookingByConfirmationCode(String confirmationCode) {
        ResponseDTO response = new ResponseDTO();

        try {
            Booking booking = bookingRepository.findByBookingConfirmationCode(confirmationCode).orElseThrow(() -> new MyException("Booking Not Found"));
            BookingDTO bookingDTO = convertorService.mapBookingEntityToBookingDTOPlusBookedRooms(booking, true);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBooking(bookingDTO);

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Finding a booking: " + e.getMessage());

        }
        return response;
    }

    @Override
    public ResponseDTO getAllBookings() {
        ResponseDTO response = new ResponseDTO();

        try {
            List<Booking> bookingList = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "bookingId"));
            List<BookingDTO> bookingDTOList = convertorService.mapBookingListEntityToBookingListDTO(bookingList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setBookingList(bookingDTOList);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Getting all bookings: " + e.getMessage());

        }
        return response;
    }

    @Override
    public ResponseDTO cancelBooking(Long bookingId) {
        ResponseDTO response = new ResponseDTO();

        try {
            bookingRepository.findById(bookingId).orElseThrow(() -> new MyException("Booking Does Not Exist"));
            bookingRepository.deleteById(bookingId);
            response.setStatusCode(200);
            response.setMessage("successful");

        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error Cancelling a booking: " + e.getMessage());

        }
        return response;
    }

    private boolean propertyIsAvailable(BookingDTO bookingRequest, List<Booking> existingBookings) {

        return existingBookings.stream()
                .noneMatch(existingBooking ->
                        bookingRequest.getCheckInDate().equals(existingBooking.getCheckInDate())
                                || bookingRequest.getCheckOutDate().isBefore(existingBooking.getCheckOutDate())
                                || (bookingRequest.getCheckInDate().isAfter(existingBooking.getCheckInDate())
                                && bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckOutDate()))
                                || (bookingRequest.getCheckInDate().isBefore(existingBooking.getCheckInDate())

                                && bookingRequest.getCheckOutDate().isAfter(existingBooking.getCheckOutDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(existingBooking.getCheckInDate()))

                                || (bookingRequest.getCheckInDate().equals(existingBooking.getCheckOutDate())
                                && bookingRequest.getCheckOutDate().equals(bookingRequest.getCheckInDate()))
                );
    }
}
