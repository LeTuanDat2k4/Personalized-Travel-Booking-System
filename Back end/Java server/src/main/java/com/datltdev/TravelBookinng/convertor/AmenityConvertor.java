package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Amenity;
import com.datltdev.TravelBookinng.model.dto.AmenityDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AmenityConvertor {
    @Autowired
    private ModelMapper modelMapper;

    public AmenityDTO convertToLocationDTO(Amenity amenity) {
        return modelMapper.map(amenity, AmenityDTO.class);
    }

    public Amenity convertToLocationEntity(AmenityDTO amenityDTO) {
        return modelMapper.map(amenityDTO, Amenity.class);
    }
}
