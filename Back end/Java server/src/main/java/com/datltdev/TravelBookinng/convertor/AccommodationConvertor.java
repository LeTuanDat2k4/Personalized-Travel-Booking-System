package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.Amenity;
import com.datltdev.TravelBookinng.entity.Location;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import jakarta.annotation.PostConstruct;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.spi.MappingContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class AccommodationConvertor {
    @Autowired
    private ModelMapper modelMapper;

    @PostConstruct
    public void configureModelMapper() {
        // Convert AccommodationType enum to String
        Converter<Accommodation.AccommodationType, String> typeConverter = ctx -> ctx.getSource() != null ? ctx.getSource().name() : null;
        // Map owner.userId to ownerId
        modelMapper.typeMap(Accommodation.class, AccommodationDTO.class)
                .addMappings(mapper -> {
                    mapper.using(typeConverter).map(Accommodation::getType, AccommodationDTO::setType);
                    mapper.map(src -> src.getOwner().getUserId(), AccommodationDTO::setOwnerId);
                    mapper.skip(AccommodationDTO::setBookings); // Skip bookings
                    mapper.skip(AccommodationDTO::setReviews); // Skip reviews
                    mapper.skip(AccommodationDTO::setAmenities); // Skip amenities
                });
    }

    public AccommodationDTO convertToAccommodationDTO(Accommodation accommodation) {
        try {
            AccommodationDTO dto = new AccommodationDTO();
            dto.setAccommodationId(accommodation.getAccommodationId());
            dto.setOwnerId(accommodation.getOwner().getUserId());
            dto.setName(accommodation.getName());
            dto.setDescription(accommodation.getDescription());
            dto.setPhotoUrl(accommodation.getPhotoUrl());
            dto.setType(accommodation.getType().name());
            dto.setPricePerNight(accommodation.getPricePerNight());
            dto.setAvailability(accommodation.getAvailability());
            dto.setAverageRating(accommodation.getAverageRating());
            dto.setCreatedAt(accommodation.getCreatedAt());
            dto.setUpdatedAt(accommodation.getUpdatedAt());
            dto.setLatitude(accommodation.getLocation().getLatitude());
            dto.setLongitude(accommodation.getLocation().getLongitude());

            // Combine location fields
            Location location = accommodation.getLocation();
            if (location != null) {
                StringBuilder combinedLocation = new StringBuilder();
                if (location.getAddress() != null && !location.getAddress().isEmpty()) {
                    combinedLocation.append(location.getAddress());
                }
                if (location.getCity() != null && !location.getCity().isEmpty()) {
                    if (combinedLocation.length() > 0) combinedLocation.append(", ");
                    combinedLocation.append(location.getCity());
                }
                if (location.getState() != null && !location.getState().isEmpty()) {
                    if (combinedLocation.length() > 0) combinedLocation.append(", ");
                    combinedLocation.append(location.getState());
                }
                if (location.getCountry() != null && !location.getCountry().isEmpty()) {
                    if (combinedLocation.length() > 0) combinedLocation.append(", ");
                    combinedLocation.append(location.getCountry());
                }
                dto.setLocation(combinedLocation.toString());
            } else {
                dto.setLocation("");
            }

            List<Amenity> amenities = accommodation.getAmenities();
            if (amenities != null && !amenities.isEmpty()) {
                String amenitiesString = amenities.stream()
                        .filter(amenity -> amenity.getName() != null && !amenity.getName().isEmpty())
                        .map(Amenity::getName)
                        .collect(Collectors.joining(", "));
                dto.setAmenities(amenitiesString);
            } else {
                dto.setAmenities("");
            }
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert Accommodation to AccommodationDTO: " + e.getMessage(), e);
        }
    }

    public Accommodation convertToAccommodationEntity(AccommodationDTO accommodationDTO) {
        return modelMapper.map(accommodationDTO, Accommodation.class);
    }
}