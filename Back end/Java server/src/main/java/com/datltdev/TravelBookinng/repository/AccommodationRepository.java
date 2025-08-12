package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {
    @Query("SELECT DISTINCT a.type FROM Accommodation a")
    List<String> findDistinctType();

    @Query("SELECT a FROM Accommodation a WHERE a.availability = true")
    List<Accommodation> getAllAvailableProperty(); // Lấy tất cả chỗ ở có sẵn

    @Query("SELECT a FROM Accommodation a WHERE a.availability = true " +
            "AND a.type IN :types " +
            "AND NOT EXISTS (SELECT b FROM Booking b WHERE b.accommodation = a " +
            "AND (b.checkInDate <= :endDate AND b.checkOutDate >= :startDate))")
    List<Accommodation> findAvailableRoomsByDatesAndTypes(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("types") List<String> types);

    @Modifying
    @Query(value = "DELETE FROM accommodation WHERE accommodation_id = :accommodationId", nativeQuery = true)
    void deleteByAccommodationId(@Param("accommodationId") Long accommodationId);

    Accommodation findByAccommodationId(Long accommodationId);

    List<Accommodation> findAllByAvailabilityTrue();

    List<Accommodation> findAllByOrderByAverageRatingDesc();
}
