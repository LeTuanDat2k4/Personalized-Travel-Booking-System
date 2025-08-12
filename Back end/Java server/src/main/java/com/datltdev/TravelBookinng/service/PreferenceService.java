package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.model.dto.PreferenceDTO;

import java.util.List;
import java.util.Map;

public interface PreferenceService {
    public Map<String, Object> getUserPreferences (Long userId);
    List<PreferenceDTO> addPreference(Long userId, List<PreferenceDTO> preferenceDTOs);
}
