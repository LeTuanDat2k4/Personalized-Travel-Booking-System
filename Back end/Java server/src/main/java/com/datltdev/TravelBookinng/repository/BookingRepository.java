package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long> {
    List<Booking> findByAccommodation_AccommodationId(Long id);
    Optional<Booking> findByBookingConfirmationCode(String confirmationCode);
    List<Booking> findByUserEntity_UserId(Long id);
}
