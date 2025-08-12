package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Preference;
import com.datltdev.TravelBookinng.model.dto.PreferenceDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PreferenceConvertor {
    @Autowired
    private ModelMapper modelMapper;

    public PreferenceDTO convertToPreferenceDTO(Preference preference) {
        return modelMapper.map(preference, PreferenceDTO.class);
    }

    public Preference convertToPreferenceEntity(PreferenceDTO preferenceDTO) {
        return modelMapper.map(preferenceDTO, Preference.class);
    }
}
