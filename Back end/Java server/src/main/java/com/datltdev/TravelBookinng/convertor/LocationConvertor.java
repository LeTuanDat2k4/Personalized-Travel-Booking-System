package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Location;
import com.datltdev.TravelBookinng.model.dto.LocationDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class LocationConvertor {
    @Autowired
    private ModelMapper modelMapper;

    public LocationDTO convertToLocationDTO(Location location) {
        return modelMapper.map(location, LocationDTO.class);
    }

    public Location convertToLocationEntity(LocationDTO locationDTO) {
        return modelMapper.map(locationDTO, Location.class);
    }
}
