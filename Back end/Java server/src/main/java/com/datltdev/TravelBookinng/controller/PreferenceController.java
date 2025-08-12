package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.model.dto.PreferenceDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.PreferenceService;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/preferences")
public class PreferenceController {
    private static final Logger logger = LoggerFactory.getLogger(PreferenceController.class);

    @Autowired
    private PreferenceService preferenceService;

    @PostMapping
    public ResponseEntity<ResponseDTO> addPreference(@RequestBody List<PreferenceDTO> preferenceDTOs) {
        Long userId = SecurityUtils.getPrincipal().getUserId();
        ResponseDTO response = new ResponseDTO();

        try {
            List<PreferenceDTO> savedPreferences = preferenceService.addPreference(userId, preferenceDTOs);
            response.setData(savedPreferences);
            response.setStatusCode(200);
            response.setMessage("Preferences added successfully");
            logger.info("Added {} preferences for user {}", savedPreferences.size(), userId);
        } catch (Exception e) {
            response.setStatusCode(400);
            response.setMessage("Error adding preferences: " + e.getMessage());
            logger.error("Error adding preferences for user {}: {}", userId, e.getMessage());
        }

        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}