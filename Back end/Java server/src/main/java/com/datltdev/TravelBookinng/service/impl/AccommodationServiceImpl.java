package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.AccommodationConvertor;
import com.datltdev.TravelBookinng.convertor.ConvertorService;
import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.Amenity;
import com.datltdev.TravelBookinng.entity.Location;
import com.datltdev.TravelBookinng.exception.MyException;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import com.datltdev.TravelBookinng.repository.AmenityRepository;
import com.datltdev.TravelBookinng.repository.LocationRepository;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.datltdev.TravelBookinng.service.AccommodationService;
import com.datltdev.TravelBookinng.service.AwsS3Service;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccommodationServiceImpl implements AccommodationService {
    private static final Logger logger = LoggerFactory.getLogger(AccommodationServiceImpl.class);

    @Autowired
    private AccommodationRepository accommodationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LocationRepository locationRepository;
    @Autowired
    private AmenityRepository amenityRepository;
    @Autowired
    private ConvertorService convertorService;
    @Autowired
    private AccommodationConvertor accommodationConvertor;
    @Autowired
    private AwsS3Service awsS3Service;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public ResponseDTO addNewAccommodation(MultipartFile photo, AccommodationDTO accommodationDTO) {
        ResponseDTO response = new ResponseDTO();

        try {
            // Validate required fields
            if (accommodationDTO.getLatitude() == null || accommodationDTO.getLongitude() == null) {
                response.setStatusCode(400);
                response.setMessage("Latitude and longitude are required");
                return response;
            }
            if (accommodationDTO.getType() == null || accommodationDTO.getType().isBlank()) {
                response.setStatusCode(400);
                response.setMessage("Accommodation type is required");
                return response;
            }

            // Parse and validate accommodation type
            try {
                Accommodation.AccommodationType.valueOf(accommodationDTO.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                response.setStatusCode(400);
                response.setMessage("Invalid accommodation type. Must be one of: HOTEL, APARTMENT, VILLA, HOSTEL");
                return response;
            }

            // Parse location string (assuming format: "address, city, state, country")
            Location location = new Location();
            if (accommodationDTO.getLocation() != null && !accommodationDTO.getLocation().isBlank()) {
                String[] locationParts = accommodationDTO.getLocation().split(",");
                location.setAddress(locationParts.length > 0 ? locationParts[0].trim() : null);
                location.setCity(locationParts.length > 1 ? locationParts[1].trim() : null);
                location.setState(locationParts.length > 2 ? locationParts[2].trim() : null);
                location.setCountry(locationParts.length > 3 ? locationParts[3].trim() : null);
            }
            location.setLatitude(accommodationDTO.getLatitude());
            location.setLongitude(accommodationDTO.getLongitude());
            Location savedLocation = locationRepository.save(location);

            // Process amenities
            List<Amenity> amenities = new ArrayList<>();
            if (accommodationDTO.getAmenities() != null && !accommodationDTO.getAmenities().isBlank()) {
                List<String> amenityNames = Arrays.stream(accommodationDTO.getAmenities().split(","))
                        .map(String::trim)
                        .filter(name -> !name.isEmpty())
                        .collect(Collectors.toList());

                for (String name : amenityNames) {
                    String normalizedName = name.toLowerCase();
                    Optional<Amenity> existingAmenity = amenityRepository.findByNameIgnoreCase(normalizedName);
                    Amenity amenity;
                    if (existingAmenity.isPresent()) {
                        amenity = existingAmenity.get();
                    } else {
                        amenity = new Amenity();
                        amenity.setName(normalizedName);
                        amenity.setDescription("Amenity: " + name);
                        amenity = amenityRepository.save(amenity);
                    }
                    amenities.add(amenity);
                }
            }

            // Save photo to S3
            String imageUrl = awsS3Service.saveImageToS3(photo);

            // Convert DTO to entity
            Accommodation accommodation = accommodationConvertor.convertToAccommodationEntity(accommodationDTO);
            accommodation.setOwner(userRepository.findById(accommodationDTO.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found")));
            accommodation.setAvailability(true);
            accommodation.setPhotoUrl(imageUrl);
            accommodation.setLocation(savedLocation);
            accommodation.setAmenities(amenities);
            accommodation.setType(Accommodation.AccommodationType.valueOf(accommodationDTO.getType().toUpperCase()));

            // Save accommodation
            Accommodation savedProperty = accommodationRepository.save(accommodation);
            AccommodationDTO propertyDTO = accommodationConvertor.convertToAccommodationDTO(savedProperty);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodation(propertyDTO);

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error saving accommodation: " + e.getMessage());
        }
        return response;
    }

    @Override
    public List<String> getAllAccommodationTypes() {
        return accommodationRepository.findDistinctType();
    }

    @Override
    public ResponseDTO getAllAccommodations() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Accommodation> roomList = accommodationRepository.findAll(Sort.by(Sort.Direction.DESC, "accommodationId"));
            List<AccommodationDTO> roomDTOList = convertorService.mapPropertyListEntityToPropertyListDTO(roomList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodationList(roomDTOList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving accommodations: " + e.getMessage());
        }
        return response;
    }

    @Override
    @Transactional
    public ResponseDTO deleteAccommodation(Long accommodationId) {
        ResponseDTO response = new ResponseDTO();
        try {
            if (!accommodationRepository.existsById(accommodationId)) {
                throw new MyException("Accommodation not found");
            }

            logger.info("Deleting accommodation ID: {}", accommodationId);

            // Perform native SQL delete
            accommodationRepository.deleteByAccommodationId(accommodationId);

            response.setStatusCode(200);
            response.setMessage("Accommodation deleted successfully");
        } catch (MyException e) {
            logger.error("Not found error deleting accommodation ID: {}", accommodationId, e);
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting accommodation ID: {}", accommodationId, e);
            response.setStatusCode(500);
            response.setMessage("Error deleting accommodation: " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO updateAccommodation(Long id, AccommodationDTO accommodationDTO, MultipartFile photo) {
        ResponseDTO response = new ResponseDTO();
        try {
            String imageUrl = null;
            if (photo != null && !photo.isEmpty()) {
                imageUrl = awsS3Service.saveImageToS3(photo);
            }
            Accommodation oldProperty = accommodationRepository.findByAccommodationId(id);
            for (Field field : AccommodationDTO.class.getDeclaredFields()) {
                field.setAccessible(true);
                Object newValue = field.get(accommodationDTO);
                if (newValue != null && !"bookings".equals(field.getName())) {
                    try {
                        Field oldField = Accommodation.class.getDeclaredField(field.getName());
                        oldField.setAccessible(true);
                        if ("type".equals(field.getName())) {
                            String typeValue = (String) newValue;
                            Accommodation.AccommodationType accommodationType = Accommodation.AccommodationType.valueOf(typeValue.toUpperCase());
                            oldField.set(oldProperty, accommodationType);
                        } else {
                            oldField.set(oldProperty, newValue);
                        }
                    } catch (NoSuchFieldException e) {
                        // Skip fields that don't exist in Accommodation
                    }
                }
            }
            if (imageUrl != null) oldProperty.setPhotoUrl(imageUrl);
            Accommodation updated = accommodationRepository.save(oldProperty);
            AccommodationDTO roomDTO = accommodationConvertor.convertToAccommodationDTO(updated);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodation(roomDTO);
        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating accommodation: " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getAccommodationById(Long roomId) {
        ResponseDTO response = new ResponseDTO();
        try {
            Accommodation property = accommodationRepository.findByAccommodationId(roomId);
            if (property == null) {
                throw new MyException("Not Found Accommodation");
            }
            AccommodationDTO propertyDTO = accommodationConvertor.convertToAccommodationDTO(property);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodation(propertyDTO);
        } catch (MyException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving accommodation: " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getAvailableAccommodationsByDataAndType(LocalDate checkInDate, LocalDate checkOutDate, List<String> roomType) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Accommodation> availableRooms = accommodationRepository.findAvailableRoomsByDatesAndTypes(checkInDate, checkOutDate, roomType);
            List<AccommodationDTO> propertyDTOList = convertorService.mapPropertyListEntityToPropertyListDTO(availableRooms);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodationList(propertyDTOList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving accommodations: " + e.getMessage());
        }
        return response;
    }

    @Override
    public ResponseDTO getAllAvailableProperties() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Accommodation> propertyList = accommodationRepository.getAllAvailableProperty();
            List<AccommodationDTO> propertyDTOList = convertorService.mapPropertyListEntityToPropertyListDTO(propertyList);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAccommodationList(propertyDTOList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving accommodations: " + e.getMessage());
        }
        return response;
    }
}