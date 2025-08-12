package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface AccommodationService {
    ResponseDTO addNewAccommodation(MultipartFile photo, AccommodationDTO Accommodation);

    List<String> getAllAccommodationTypes();

    ResponseDTO getAllAccommodations();

    ResponseDTO deleteAccommodation(Long roomId);

    ResponseDTO updateAccommodation(Long Id, AccommodationDTO AccommodationDTO, MultipartFile photo);

    ResponseDTO getAccommodationById(Long roomId);

    ResponseDTO getAvailableAccommodationsByDataAndType(LocalDate checkInDate, LocalDate checkOutDate, List<String> roomType);

    ResponseDTO getAllAvailableProperties();
}
