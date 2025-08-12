package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.convertor.ConvertorService;
import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.RecommendationService;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ConvertorService convertorService;

    @PostMapping("/new")
    public ResponseEntity<ResponseDTO> getNewUserRecommendations(
            @RequestBody Map<String, Object> userFeatures,
            @RequestParam(defaultValue = "10") int limit) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Accommodation> recommendations = recommendationService.getNewUserRecommendations(userFeatures, limit);
            List<AccommodationDTO> accommodationDTOS = convertorService.mapPropertyListEntityToPropertyListDTO(recommendations);
            response.setAccommodationList(accommodationDTOS);
            response.setStatusCode(200);
            response.setMessage("New user recommendations retrieved successfully");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving new user recommendations: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseDTO> getLocationBasedRecommendations(
            @RequestParam String searchLocation,
            @RequestParam(required = false) String checkInDate,
            @RequestParam(required = false) String checkOutDate,
            @RequestParam(required = false) List<String> types) {
        Long userId = SecurityUtils.getPrincipal().getUserId();
        ResponseDTO response = new ResponseDTO();
        try {
            LocalDate checkIn = checkInDate != null ? LocalDate.parse(checkInDate) : null;
            LocalDate checkOut = checkOutDate != null ? LocalDate.parse(checkOutDate) : null;
            List<Accommodation> recommendations = recommendationService.getLocationBasedRecommendations(
                    userId, searchLocation, checkIn, checkOut, types);
            List<AccommodationDTO> accommodationDTOS = convertorService.mapPropertyListEntityToPropertyListDTO(recommendations);
            response.setAccommodationList(accommodationDTOS);
            response.setStatusCode(200);
            response.setMessage("Location-based recommendations retrieved successfully for location: " + searchLocation);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving location-based recommendations: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getRecommendations(@RequestParam(defaultValue = "10") int limit) {
        Long userId = SecurityUtils.getPrincipal().getUserId();
        ResponseDTO response = new ResponseDTO();
        try {
            List<Accommodation> recommendations = recommendationService.getHybridRecommendations(userId, limit);
            List<AccommodationDTO> accommodationDTOS = convertorService.mapPropertyListEntityToPropertyListDTO(recommendations);
            response.setAccommodationList(accommodationDTOS);
            response.setStatusCode(200);
            response.setMessage("Recommendations retrieved successfully");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving recommendations: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}