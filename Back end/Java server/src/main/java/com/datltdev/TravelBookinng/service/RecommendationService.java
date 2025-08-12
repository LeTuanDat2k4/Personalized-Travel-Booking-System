package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.entity.*;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import com.datltdev.TravelBookinng.repository.AmenityRepository;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    // Helper method to normalize strings by removing diacritics, spaces, and converting to lowercase
    private String normalizeString(String input) {
        if (input == null) {
            return "";
        }
        String temp = input;

        // Manually replace the Vietnamese 'D' with a standard 'D'
        // This is the key fix for your issue with "Đà Nẵng"
        temp = temp.replaceAll("Đ", "D");
        temp = temp.replaceAll("đ", "d");

        // Normalize to decompose diacritics
        String normalized = Normalizer.normalize(temp, Normalizer.Form.NFD);
        // Remove diacritical marks
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        normalized = pattern.matcher(normalized).replaceAll("");
        // Remove spaces and convert to lowercase
        return normalized.replaceAll("\\s+", "").toLowerCase();
    }

    // Fetch recommendations for new user
    public List<Accommodation> getNewUserRecommendations(Map<String, Object> userFeatures, int limit) {
        logger.info("Fetching recommendations for new user with features: {}", userFeatures);
        String url = "http://localhost:5000/recommend_new";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new HashMap<>();
        body.put("user_features", userFeatures);
        body.put("top_n", limit);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            // Use ResponseEntity to capture raw response for debugging
            ResponseEntity<String> rawResponse = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            logger.debug("Raw response from NCF service: {}", rawResponse.getBody());

            // Parse JSON response into List<Map<String, Object>>
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> response = mapper.readValue(
                    rawResponse.getBody(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            List<Accommodation> recommendations = response.stream()
                    .map(item -> {
                        // Handle accommodation_id as Number or String
                        Long accommodationId;
                        Object idObj = item.get("accommodation_id");
                        if (idObj instanceof Number) {
                            accommodationId = ((Number) idObj).longValue();
                        } else if (idObj instanceof String) {
                            accommodationId = Long.parseLong((String) idObj);
                        } else {
                            logger.warn("Invalid accommodation_id format: {}", idObj);
                            return null;
                        }
                        return accommodationRepository.findById(accommodationId).orElse(null);
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            logger.info("Returning {} recommendations for new user", recommendations.size());
            return recommendations;
        } catch (Exception e) {
            logger.error("Error fetching new user recommendations: {}", e.getMessage(), e);
            List<Accommodation> fallback = accommodationRepository.findAllByOrderByAverageRatingDesc()
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
            logger.info("Returning {} fallback recommendations", fallback.size());
            return fallback;
        }
    }

    // Fetch hybrid recommendations
    public List<Accommodation> getHybridRecommendations(Long userId, int limit) {
        logger.info("Fetching hybrid recommendations for user {}", userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Preference> preferences = user.getPreferences();
        List<Interaction> interactions = user.getInteractions();
        int interactionCount = interactions.size();
        logger.info("User {} has {} preferences and {} interactions", userId, preferences.size(), interactionCount);

        // Determine weights
        double contentWeight = interactionCount < 5 ? 1.0 : (interactionCount < 20 ? 0.7 : 0.3);
        double ncfWeight = 1.0 - contentWeight;

        // Content-based Filtering
        double[] userProfile = buildUserProfile(interactions, preferences);
        List<Accommodation> candidates = filterAccommodations(preferences);
        logger.info("Found {} candidate accommodations", candidates.size());
        Map<Long, Double> contentScores = candidates.stream()
                .collect(Collectors.toMap(
                        Accommodation::getAccommodationId,
                        acc -> computeSimilarity(userProfile, buildFeatureVector(acc))
                ));

        // NCF Scores
        Map<Long, Double> ncfScores = contentWeight < 1.0 ? getNCFScores(userId, candidates) : new HashMap<>();
        logger.info("Retrieved {} NCF scores", ncfScores.size());

        // Combine scores
        List<AccommodationScore> finalScores = candidates.stream()
                .map(acc -> {
                    double contentScore = contentScores.getOrDefault(acc.getAccommodationId(), 0.0);
                    double ncfScore = ncfScores.getOrDefault(acc.getAccommodationId(), 0.0);
                    double score = contentWeight * contentScore + ncfWeight * ncfScore;
                    return new AccommodationScore(acc, score);
                })
                .sorted(Comparator.comparingDouble(AccommodationScore::getScore).reversed())
                .collect(Collectors.toList());

        List<Accommodation> recommendations = finalScores.stream()
                .limit(limit)
                .map(AccommodationScore::getAccommodation)
                .collect(Collectors.toList());

        logger.info("Returning {} recommendations for user {}", recommendations.size(), userId);
        return recommendations;
    }

    // Fetch location-based recommendations
    public List<Accommodation> getLocationBasedRecommendations(Long userId, String searchLocation, LocalDate checkInDate, LocalDate checkOutDate, List<String> types) {
        logger.info("Fetching location-based recommendations for user {} in location {} with checkInDate: {}, checkOutDate: {}, types: {}",
                userId, searchLocation, checkInDate, checkOutDate, types);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Preference> preferences = user.getPreferences();
        List<Interaction> interactions = user.getInteractions();
        int interactionCount = interactions.size();
        logger.info("User {} has {} preferences and {} interactions", userId, preferences.size(), interactionCount);

        // Determine weights
        double contentWeight = interactionCount < 5 ? 1.0 : (interactionCount < 20 ? 0.7 : 0.3);
        double ncfWeight = 1.0 - contentWeight;

        // Content-based Filtering
        double[] userProfile = buildUserProfile(interactions, preferences);
        List<Accommodation> candidates;

        // Normalize search location
        String normalizedSearchLocation = normalizeString(searchLocation);

        // Filter by location and optionally by dates and types
        if (checkInDate != null && checkOutDate != null && types != null && !types.isEmpty()) {
            candidates = accommodationRepository.findAvailableRoomsByDatesAndTypes(checkInDate, checkOutDate, types);
            candidates = accommodationRepository.findAvailableRoomsByDatesAndTypes(checkInDate, checkOutDate, types)
                    .stream()
                    .filter(acc -> {
                        Location loc = acc.getLocation();
                        if (loc == null) return false;
                        String city = normalizeString(loc.getCity());
                        String country = normalizeString(loc.getCountry());
                        String address = normalizeString(loc.getAddress());
                        String name = normalizeString(acc.getName());
                        return city.contains(normalizedSearchLocation) ||
                                country.contains(normalizedSearchLocation) ||
                                address.contains(normalizedSearchLocation) ||
                                name.contains(normalizedSearchLocation);
                    })
                    .collect(Collectors.toList());
        } else if (checkInDate != null && checkOutDate != null) {
            candidates = accommodationRepository.findAvailableRoomsByDatesAndTypes(checkInDate, checkOutDate, accommodationRepository.findDistinctType());
            candidates = accommodationRepository.findAvailableRoomsByDatesAndTypes(checkInDate, checkOutDate, accommodationRepository.findDistinctType())
                    .stream()
                    .filter(acc -> {
                        Location loc = acc.getLocation();
                        if (loc == null) return false;
                        String city = normalizeString(loc.getCity());
                        String country = normalizeString(loc.getCountry());
                        String address = normalizeString(loc.getAddress());
                        String name = normalizeString(acc.getName());
                        return city.contains(normalizedSearchLocation) ||
                                country.contains(normalizedSearchLocation) ||
                                address.contains(normalizedSearchLocation) ||
                                name.contains(normalizedSearchLocation);
                    })
                    .collect(Collectors.toList());
        } else {
            candidates = filterAccommodationsByLocation(searchLocation);
        }

        logger.info("Found {} candidate accommodations in location {}", candidates.size(), searchLocation);

        if (candidates.isEmpty()) {
            logger.info("No accommodations found for location {}, returning fallback popular accommodations", searchLocation);
            candidates = accommodationRepository.findAllByOrderByAverageRatingDesc();
        }

        // Compute content-based scores
        Map<Long, Double> contentScores = candidates.stream()
                .collect(Collectors.toMap(
                        Accommodation::getAccommodationId,
                        acc -> computeSimilarity(userProfile, buildFeatureVector(acc))
                ));

        // NCF Scores
        Map<Long, Double> ncfScores = contentWeight < 1.0 ? getNCFScores(userId, candidates) : new HashMap<>();
        logger.info("Retrieved {} NCF scores", ncfScores.size());

        // Combine scores
        List<AccommodationScore> finalScores = candidates.stream()
                .map(acc -> {
                    double contentScore = contentScores.getOrDefault(acc.getAccommodationId(), 0.0);
                    double ncfScore = ncfScores.getOrDefault(acc.getAccommodationId(), 0.0);
                    double score = contentWeight * contentScore + ncfWeight * ncfScore;
                    return new AccommodationScore(acc, score);
                })
                .sorted(Comparator.comparingDouble(AccommodationScore::getScore).reversed())
                .collect(Collectors.toList());

        List<Accommodation> recommendations = finalScores.stream()
                .map(AccommodationScore::getAccommodation)
                .collect(Collectors.toList());

        logger.info("Returning {} location-based recommendations for user {} in location {}",
                recommendations.size(), userId, searchLocation);
        return recommendations;
    }

    // Fetch NCF scores
    private Map<Long, Double> getNCFScores(Long userId, List<Accommodation> candidates) {
        logger.info("Fetching NCF scores for user {}", userId);
        Map<Long, Double> scores = new HashMap<>();
        if (candidates.isEmpty()) {
            logger.warn("No candidates provided for NCF scoring");
            return scores;
        }

        List<Long> itemIds = candidates.stream()
                .map(Accommodation::getAccommodationId)
                .collect(Collectors.toList());

        // Prepare item feature data
        List<Map<String, Object>> itemFeatures = candidates.stream().map(acc -> {
            Map<String, Object> features = new HashMap<>();
            features.put("accommodation_id", acc.getAccommodationId());
            features.put("price_per_night", acc.getPricePerNight());
            features.put("average_rating", acc.getAverageRating() != null ? acc.getAverageRating() : 0.0);
            features.put("location_city", acc.getLocation() != null && acc.getLocation().getCity() != null ? acc.getLocation().getCity() : "");
            features.put("type", acc.getType().toString());
            features.put("amenities", acc.getAmenities().stream()
                    .map(Amenity::getName)
                    .collect(Collectors.toList()));
            return features;
        }).collect(Collectors.toList());

        // Prepare user feature data
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> userFeatures = new HashMap<>();
        userFeatures.put("user_id", userId);
        Map<String, String> preferencesMap = user.getPreferences().stream()
                .collect(Collectors.toMap(
                        pref -> pref.getPreferenceType().toString(),
                        Preference::getValue,
                        (v1, v2) -> v1
                ));
        userFeatures.put("budget_pref", preferencesMap.getOrDefault("PRICE", "100000"));
        userFeatures.put("location_pref_str", preferencesMap.getOrDefault("LOCATION", "Hà Nội"));
        userFeatures.put("property_type_pref_str", preferencesMap.getOrDefault("TYPE", "HOTEL"));
        userFeatures.put("amenities_pref", preferencesMap.getOrDefault("AMENITY", "").split(","));
        userFeatures.put("travel_frequency_score", 1.0); // Default value

        String url = "http://localhost:5000/predict";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new HashMap<>();
        body.put("user_id", userId);
        body.put("item_ids", itemIds);
        body.put("item_features", itemFeatures);
        body.put("user_features", userFeatures);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            List<Double> predictions = (List<Double>) response.get("predictions");
            List<Long> validItemIds = response.get("valid_item_ids") != null ?
                    ((List<?>) response.get("valid_item_ids")).stream()
                            .map(id -> Long.valueOf(id.toString()))
                            .collect(Collectors.toList()) :
                    new ArrayList<>();
            List<Long> missingItemIds = response.get("missing_item_ids") != null ?
                    ((List<?>) response.get("missing_item_ids")).stream()
                            .map(id -> Long.valueOf(id.toString()))
                            .collect(Collectors.toList()) :
                    new ArrayList<>();
            if (!missingItemIds.isEmpty()) {
                logger.warn("Missing item IDs in NCF response: {}.", missingItemIds);
            }
            if (predictions.size() != validItemIds.size()) {
                logger.warn("Mismatch in number of predictions ({}) and valid item IDs ({})", predictions.size(), validItemIds.size());
            }
            for (int i = 0; i < Math.min(predictions.size(), validItemIds.size()); i++) {
                scores.put(validItemIds.get(i), predictions.get(i));
            }
            // Assign default score for missing items
            for (Long itemId : itemIds) {
                if (!validItemIds.contains(itemId)) {
                    scores.put(itemId, 0.0);
                    logger.debug("Assigned default score 0.0 to missing item ID {}", itemId);
                }
            }
            logger.info("Successfully retrieved NCF scores for {} items", scores.size());
        } catch (Exception e) {
            logger.error("Error fetching NCF scores: {}", e.getMessage());
            candidates.forEach(acc -> scores.put(acc.getAccommodationId(), 0.0));
        }

        return scores;
    }

    // Filter accommodations by location
    private List<Accommodation> filterAccommodationsByLocation(String searchLocation) {
        logger.info("Filtering accommodations by location: {}", searchLocation);
        List<Accommodation> allAccommodations = accommodationRepository.findAllByOrderByAverageRatingDesc();
        if (allAccommodations.isEmpty()) {
            logger.warn("No accommodations found in database");
            return Collections.emptyList();
        }

        String normalizedSearchLocation = normalizeString(searchLocation);
        List<Accommodation> filtered = allAccommodations.stream()
                .filter(acc -> {
                    Location loc = acc.getLocation();
                    if (loc == null) return false;
                    String city = normalizeString(loc.getCity());
                    String country = normalizeString(loc.getCountry());
                    String address = normalizeString(loc.getAddress());
                    String name = normalizeString(acc.getName());
                    return city.contains(normalizedSearchLocation) ||
                            country.contains(normalizedSearchLocation) ||
                            address.contains(normalizedSearchLocation) ||
                            name.contains(normalizedSearchLocation);
                })
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            logger.info("No accommodations found for location {}, returning {} popular accommodations",
                    searchLocation, allAccommodations.size());
            filtered = allAccommodations;
        } else {
            logger.info("Filtered {} accommodations for location {}", filtered.size(), searchLocation);
        }
        return filtered;
    }

    // Build user profile
    private double[] buildUserProfile(List<Interaction> interactions, List<Preference> preferences) {
        int featureSize = getFeatureSize();
        double[] profile = new double[featureSize];

        if (interactions.isEmpty() && preferences.isEmpty()) {
            logger.warn("No interactions or preferences found for user profile");
            return profile;
        }

        // From interactions
        if (!interactions.isEmpty()) {
            List<double[]> vectors = new ArrayList<>();
            double totalWeight = 0.0;

            for (Interaction interaction : interactions) {
                double weight = switch (interaction.getInteractionType()) {
                    case BOOKING -> 3.0;
                    case WISHLIST -> 0.5;
                    case CLICK -> 0.8;
                };
                double[] vector = buildFeatureVector(interaction.getAccommodation());
                vectors.add(vector);
                totalWeight += weight;

                for (int i = 0; i < featureSize; i++) {
                    profile[i] += vector[i] * weight;
                }
            }

            if (totalWeight > 0) {
                for (int i = 0; i < featureSize; i++) {
                    profile[i] /= totalWeight;
                }
            }
        }

        // From explicit preferences
        for (Preference pref : preferences) {
            switch (pref.getPreferenceType()) {
                case TYPE:
                    int typeIndex = getTypeIndex(pref.getValue());
                    if (typeIndex >= 0) profile[typeIndex] = 1.0;
                    break;
                case AMENITY:
                    int amenityIndex = getAmenityIndex(pref.getValue());
                    if (amenityIndex >= 0) profile[5 + amenityIndex] = 1.0;
                    break;
                case PRICE:
                    double price = parsePrice(pref.getValue());
                    profile[4] = (price - 50.0) / (200.0 - 50.0);
                    break;
                case LOCATION:
                    break;
            }
        }

        return profile;
    }

    // Filter accommodations
    private List<Accommodation> filterAccommodations(List<Preference> preferences) {
        logger.info("Filtering accommodations based on {} preferences", preferences.size());
        List<Accommodation> allAccommodations = accommodationRepository.findAllByOrderByAverageRatingDesc();
        if (allAccommodations.isEmpty() || preferences.isEmpty()) return allAccommodations;

        List<Accommodation> result = new ArrayList<>();
        for (Preference pref : preferences) {
            List<Accommodation> filtered = new ArrayList<>(allAccommodations);
            switch (pref.getPreferenceType()) {
                case LOCATION:
                    String locationValue = normalizeString(pref.getValue());
                    filtered = filtered.stream()
                            .filter(acc -> {
                                Location loc = acc.getLocation();
                                if (loc == null) return false;
                                String city = normalizeString(loc.getCity());
                                String country = normalizeString(loc.getCountry());
                                return city.contains(locationValue) || country.contains(locationValue);
                            })
                            .collect(Collectors.toList());
                    break;
                case TYPE:
                    try {
                        Accommodation.AccommodationType type = Accommodation.AccommodationType.valueOf(pref.getValue());
                        filtered = filtered.stream()
                                .filter(acc -> acc.getType() == type)
                                .collect(Collectors.toList());
                    } catch (IllegalArgumentException e) {
                        filtered = Collections.emptyList();
                    }
                    break;
                case AMENITY:
                    String amenityName = pref.getValue();
                    filtered = filtered.stream()
                            .filter(acc -> acc.getAmenities() != null &&
                                    acc.getAmenities().stream()
                                            .anyMatch(amenity -> amenity.getName() != null &&
                                                    normalizeString(amenity.getName()).contains(normalizeString(amenityName))))
                            .collect(Collectors.toList());
                    break;
                case PRICE:
                    double price = parsePrice(pref.getValue());
                    filtered = filtered.stream()
                            .filter(acc -> acc.getPricePerNight() != null &&
                                    acc.getPricePerNight() >= price * 0.5 &&
                                    acc.getPricePerNight() <= price * 1.5)
                            .collect(Collectors.toList());
                    break;
            }
            result.addAll(filtered);
        }
        result = result.stream().distinct().collect(Collectors.toList());
        if (result.isEmpty()) {
            result = allAccommodations;
            logger.info("No matching accommodations found, returning {} popular accommodations", result.size());
        } else {
            logger.info("Filtered {} accommodations based on preferences", result.size());
        }
        return result;
    }

    // Build feature vector
    private double[] buildFeatureVector(Accommodation acc) {
        List<Amenity> allAmenities = amenityRepository.findAll();
        double[] vector = new double[getFeatureSize()];

        switch (acc.getType()) {
            case HOTEL: vector[0] = 1; break;
            case APARTMENT: vector[1] = 1; break;
            case VILLA: vector[2] = 1; break;
            case HOSTEL: vector[3] = 1; break;
        }

        double minPrice = 50.0, maxPrice = 200.0;
        vector[4] = Math.min(Math.max((acc.getPricePerNight() - minPrice) / (maxPrice - minPrice), 0.0), 1.0);

        for (int i = 0; i < allAmenities.size(); i++) {
            vector[5 + i] = acc.getAmenities().contains(allAmenities.get(i)) ? 1.0 : 0.0;
        }

        return vector;
    }

    private int getFeatureSize() {
        return 5 + (int) amenityRepository.count();
    }

    private double computeSimilarity(double[] userProfile, double[] accVector) {
        double dotProduct = 0.0, normUser = 0.0, normAcc = 0.0;
        for (int i = 0; i < userProfile.length; i++) {
            dotProduct += userProfile[i] * accVector[i];
            normUser += Math.pow(userProfile[i], 2);
            normAcc += Math.pow(accVector[i], 2);
        }
        if (normUser == 0 || normAcc == 0) return 0.0;
        return dotProduct / (Math.sqrt(normUser) * Math.sqrt(normAcc));
    }

    private int getTypeIndex(String type) {
        try {
            switch (Accommodation.AccommodationType.valueOf(type)) {
                case HOTEL: return 0;
                case APARTMENT: return 1;
                case VILLA: return 2;
                case HOSTEL: return 3;
                default: return -1;
            }
        } catch (IllegalArgumentException e) {
            return -1;
        }
    }

    private int getAmenityIndex(String amenityName) {
        List<Amenity> allAmenities = amenityRepository.findAll();
        for (int i = 0; i < allAmenities.size(); i++) {
            if (allAmenities.get(i).getName() != null &&
                    normalizeString(allAmenities.get(i).getName()).equalsIgnoreCase(normalizeString(amenityName))) {
                return i;
            }
        }
        return -1;
    }

    private double parsePrice(String priceStr) {
        try {
            return Double.parseDouble(priceStr.replaceAll("[^0-9.]", ""));
        } catch (NumberFormatException e) {
            return 100.0;
        }
    }

    private static class AccommodationScore {
        private final Accommodation accommodation;
        private final double score;

        public AccommodationScore(Accommodation accommodation, double score) {
            this.accommodation = accommodation;
            this.score = score;
        }

        public Accommodation getAccommodation() {
            return accommodation;
        }

        public double getScore() {
            return score;
        }
    }
}