package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.PreferenceConvertor;
import com.datltdev.TravelBookinng.entity.Preference;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.model.dto.PreferenceDTO;
import com.datltdev.TravelBookinng.repository.PreferenceRepository;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.datltdev.TravelBookinng.service.PreferenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PreferenceServiceImpl implements PreferenceService {
    private static final Logger logger = LoggerFactory.getLogger(PreferenceServiceImpl.class);

    @Autowired
    private PreferenceRepository preferenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreferenceConvertor preferenceConvertor;

    @Override
    public Map<String, Object> getUserPreferences(Long userId) {
        logger.info("Fetching preferences for user {}", userId);
        List<Preference> preferences = preferenceRepository.findByUserEntity_UserId(userId);
        Map<String, Object> preferenceMap = new HashMap<>();
        preferences.forEach(pref ->
                preferenceMap.put(pref.getPreferenceType().toString(), pref.getValue())
        );
        logger.info("Found {} preferences for user {}", preferences.size(), userId);
        return preferenceMap;
    }

    @Override
    public List<PreferenceDTO> addPreference(Long userId, List<PreferenceDTO> preferenceDTOs) {
        logger.info("Adding {} preferences for user {}", preferenceDTOs.size(), userId);

        // Validate user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User with ID {} not found", userId);
                    return new RuntimeException("User not found");
                });

        if (!user.getRole().equals(UserEntity.Role.TRAVELER)) {
            logger.error("User {} is not a TRAVELER", userId);
            throw new RuntimeException("Only TRAVELER users can add preferences");
        }

        // Validate preferenceDTOs
        if (preferenceDTOs == null || preferenceDTOs.isEmpty()) {
            logger.error("Preference list is null or empty");
            throw new RuntimeException("Preference list cannot be null or empty");
        }

        List<Preference> preferencesToSave = new ArrayList<>();
        for (PreferenceDTO preferenceDTO : preferenceDTOs) {
            if (preferenceDTO.getPreferenceType() == null || preferenceDTO.getValue() == null) {
                logger.error("Invalid preference data: type or value is null");
                throw new RuntimeException("Preference type and value are required for all preferences");
            }

            try {
                Preference.PreferenceType.valueOf(preferenceDTO.getPreferenceType());
            } catch (IllegalArgumentException e) {
                logger.error("Invalid preference type: {}", preferenceDTO.getPreferenceType());
                throw new RuntimeException("Invalid preference type: " + preferenceDTO.getPreferenceType());
            }

            // Convert DTO to entity
            Preference preference = preferenceConvertor.convertToPreferenceEntity(preferenceDTO);
            preference.setUserEntity(user);
            preferencesToSave.add(preference);
        }

        // Save all preferences
        List<Preference> savedPreferences = preferenceRepository.saveAll(preferencesToSave);
        logger.info("Successfully added {} preferences for user {}", savedPreferences.size(), userId);

        // Convert back to DTOs and set userId
        List<PreferenceDTO> savedPreferenceDTOs = savedPreferences.stream()
                .map(preference -> {
                    PreferenceDTO dto = preferenceConvertor.convertToPreferenceDTO(preference);
                    dto.setUserId(userId);
                    return dto;
                })
                .collect(Collectors.toList());

        return savedPreferenceDTOs;
    }
}