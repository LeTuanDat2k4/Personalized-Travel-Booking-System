package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import jakarta.annotation.PostConstruct;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class UserConvertor {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AccommodationConvertor accommodationConvertor;
    @Autowired
    private PreferenceConvertor preferenceConvertor;

    @PostConstruct
    public void configureModelMapper() {
        // Convert Role enum to String
        Converter<UserEntity.Role, String> roleConverter = ctx -> ctx.getSource() != null ? ctx.getSource().name() : null;
        modelMapper.typeMap(UserEntity.class, UserDTO.class)
                .addMappings(mapper -> {
                    mapper.using(roleConverter).map(UserEntity::getRole, UserDTO::setRole);
                    mapper.skip(UserDTO::setBookings); // Skip bookings
                    mapper.skip(UserDTO::setPreferences); // Skip preferences
                });
    }

    public UserDTO convertToUserDTO(UserEntity user) {
        try {
            UserDTO userDTO = modelMapper.map(user, UserDTO.class);
            // Map accommodations
            userDTO.setAccommodations(user.getAccommodations() != null
                    ? user.getAccommodations().stream()
                    .map(accommodationConvertor::convertToAccommodationDTO)
                    .collect(Collectors.toList())
                    : new ArrayList<>());
            // Map preferences
            userDTO.setPreferences(user.getPreferences() != null
                    ? user.getPreferences().stream()
                    .map(preferenceConvertor::convertToPreferenceDTO)
                    .collect(Collectors.toList())
                    : new ArrayList<>());
            return userDTO;
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert UserEntity to UserDTO: " + e.getMessage(), e);
        }
    }

    public UserEntity convertToUserEntity(UserDTO userDTO) {
        return modelMapper.map(userDTO, UserEntity.class);
    }
}