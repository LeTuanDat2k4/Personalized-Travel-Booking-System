package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.AccommodationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/properties")
public class PropertyController {
    @Autowired
    AccommodationService accommodationService;

    @PostMapping("/add")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> addNewAccommodation(
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @ModelAttribute AccommodationDTO accommodationDTO
    ) {
        if (photo == null || photo.isEmpty() || accommodationDTO.getType() == null ||
                accommodationDTO.getType().isBlank() || accommodationDTO.getPricePerNight() == null ||
                accommodationDTO.getOwnerId() == null) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Please provide values for all fields (photo, propertyType, propertyPrice, ownerId)");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = accommodationService.addNewAccommodation(photo, accommodationDTO);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/all")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> getAllAccommodations() {
        ResponseDTO response = accommodationService.getAllAccommodations();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/types")
    public List<String> getAccommodationTypes() {
        return accommodationService.getAllAccommodationTypes();
    }

    @GetMapping("/property-by-id/{propertyId}")
    public ResponseEntity<ResponseDTO> getPropertyById(@PathVariable Long propertyId) {
        if (propertyId == null || propertyId <= 0) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid property ID");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = accommodationService.getAccommodationById(propertyId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/all-available-properties")
    public ResponseEntity<ResponseDTO> getAvailableAccommodation() {
        ResponseDTO response = accommodationService.getAllAvailableProperties();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/available-properties-by-date-and-type")
    public ResponseEntity<ResponseDTO> getAvailableAccommodationByDateAndType(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false) List<String> roomType
    ) {
        if (checkInDate == null || checkOutDate == null || roomType == null || roomType.isEmpty()) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Please provide values for all fields (checkInDate, checkOutDate, roomType)");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        if (checkInDate.isAfter(checkOutDate)) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Check-in date must be before check-out date");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = accommodationService.getAvailableAccommodationsByDataAndType(checkInDate, checkOutDate, roomType);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/update/{propertyId}")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> updateAccommodation(@PathVariable Long propertyId,
                                               @RequestParam(value = "photo", required = false) MultipartFile photo,
                                               @ModelAttribute AccommodationDTO accommodationDTO

    ) {
        if (propertyId == null || propertyId <= 0) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid property ID");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = accommodationService.updateAccommodation(propertyId, accommodationDTO, photo);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/{propertyId}")
//    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ResponseDTO> deleteRoom(@PathVariable Long propertyId) {
        if (propertyId == null || propertyId <= 0) {
            ResponseDTO response = new ResponseDTO();
            response.setStatusCode(400);
            response.setMessage("Invalid property ID");
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }
        ResponseDTO response = accommodationService.deleteAccommodation(propertyId);
        return ResponseEntity.status(response.getStatusCode()).body(response);

    }
}
