package com.datltdev.TravelBookinng.repository.custom;


import com.datltdev.TravelBookinng.entity.Accommodation;

import java.time.LocalDate;
import java.util.List;

public interface AccommodationRepositoryCustom {
    List<Accommodation> findAvailableRoomsByDatesAndTypes(LocalDate checkInDate, LocalDate checkOutDate, String Type);

}
