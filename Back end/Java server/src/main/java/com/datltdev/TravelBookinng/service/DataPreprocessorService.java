package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.entity.*;
import com.datltdev.TravelBookinng.repository.*;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.geotools.referencing.GeodeticCalculator;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataPreprocessorService {

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreferenceRepository preferenceRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    // Tiền xử lý dữ liệu chỗ ở
    public Map<String, Object> preprocessAccommodationData() {
        List<Accommodation> accommodations = accommodationRepository.findAllByAvailabilityTrue();
        List<Amenity> allAmenities = amenityRepository.findAll();

        // Tạo danh sách đặc trưng
        List<Map<String, Object>> accommodationFeatures = new ArrayList<>();
        Map<Long, Long> itemIdMapper = new HashMap<>();
        Set<String> topAmenities = getTopAmenities(accommodations, 30);

        // Thu thập giá, xếp hạng, khoảng cách để chuẩn hóa
        DescriptiveStatistics priceStats = new DescriptiveStatistics();
        DescriptiveStatistics ratingStats = new DescriptiveStatistics();
        DescriptiveStatistics distanceStats = new DescriptiveStatistics();

        for (Accommodation acc : accommodations) {
            priceStats.addValue(acc.getPricePerNight());
            ratingStats.addValue(acc.getAverageRating() != null ? acc.getAverageRating() : 3.0);
            distanceStats.addValue(calculateDistanceToCenter(acc.getLocation()));
        }

        double priceMedian = priceStats.getPercentile(50);
        double ratingMedian = ratingStats.getPercentile(50);
        double distanceMedian = distanceStats.getPercentile(50);

        for (Accommodation acc : accommodations) {
            Map<String, Object> features = new HashMap<>();
            features.put("accommodation_id", acc.getAccommodationId());
            features.put("original_id", acc.getAccommodationId());
            features.put("price_cleaned", acc.getPricePerNight() != null ? acc.getPricePerNight() : priceMedian);
            features.put("rating_cleaned", acc.getAverageRating() != null ? acc.getAverageRating() : ratingMedian);
            features.put("property_type", acc.getType().toString());

            // Xử lý vị trí
            Location loc = acc.getLocation();
            String locationParsed = loc != null && loc.getCity() != null ? loc.getCity() : "Unknown";
            features.put("location_parsed", locationParsed);

            // Tính khoảng cách đến trung tâm
            double distanceToCenter = calculateDistanceToCenter(loc);
            features.put("distance_to_center", distanceToCenter != 0.0 ? distanceToCenter : distanceMedian);

            // Xử lý tiện nghi
            List<String> amenities = acc.getAmenities().stream()
                    .map(Amenity::getName)
                    .filter(topAmenities::contains)
                    .collect(Collectors.toList());
            features.put("amenities_filtered", amenities);

            // Chuẩn hóa đặc trưng số
            double logPrice = Math.log1p((Double) features.get("price_cleaned"));
            double clippedRating = Math.min(Math.max((Double) features.get("rating_cleaned"), 1.0), 5.0);
            double logDistance = Math.log1p((Double) features.get("distance_to_center"));

            features.put("log_price", standardize(logPrice, priceStats));
            features.put("rating_cleaned", standardize(clippedRating, ratingStats));
            features.put("log_distance", standardize(logDistance, distanceStats));

            accommodationFeatures.add(features);
            itemIdMapper.put(acc.getAccommodationId(), acc.getAccommodationId());
        }

        // Mã hóa đặc trưng phân loại (one-hot và multi-label)
        Map<String, Object> encodedFeatures = encodeAccommodationFeatures(accommodationFeatures, topAmenities);

        Map<String, Object> result = new HashMap<>();
        result.put("accommodation_features", encodedFeatures.get("features"));
        result.put("item_id_mapper", itemIdMapper);
        result.put("num_items", accommodations.size());
        result.put("item_feature_cols", encodedFeatures.get("item_feature_cols"));
        return result;
    }

    // Tiền xử lý dữ liệu người dùng
    public Map<String, Object> preprocessUserData(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Preference> preferences = preferenceRepository.findByUserEntity_UserId(userId);
        List<Interaction> interactions = interactionRepository.findByUser_UserId(userId);

        Map<String, Object> userFeatures = new HashMap<>();
        userFeatures.put("user_id", userId);

        // Sở thích vị trí
        String locationPref = preferences.stream()
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.LOCATION)
                .map(Preference::getValue)
                .findFirst()
                .orElse("Unknown");
        userFeatures.put("location", locationPref);

        // Ngân sách
        double budget = preferences.stream()
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.PRICE)
                .map(p -> parsePrice(p.getValue()))
                .findFirst()
                .orElse(100.0);
        userFeatures.put("budget", budget);

        // Tiện nghi
        List<String> amenities = preferences.stream()
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.AMENITY)
                .map(Preference::getValue)
                .collect(Collectors.toList());
        userFeatures.put("amenities", amenities);

        // Loại chỗ ở
        String typePref = preferences.stream()
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.TYPE)
                .map(Preference::getValue)
                .findFirst()
                .orElse("HOTEL");
        userFeatures.put("property_type", typePref);

        // Tần suất du lịch
        long bookingCount = interactions.stream()
                .filter(i -> i.getInteractionType() == Interaction.InteractionType.BOOKING)
                .count();
        double travelFrequency = bookingCount < 5 ? 0.5 : (bookingCount < 20 ? 1.0 : 1.5);
        userFeatures.put("travel_frequency", travelFrequency);

        // Chuẩn hóa đặc trưng số
        DescriptiveStatistics budgetStats = getBudgetStatistics();
        DescriptiveStatistics frequencyStats = new DescriptiveStatistics();
        frequencyStats.addValue(0.5);
        frequencyStats.addValue(1.0);
        frequencyStats.addValue(1.5);

        userFeatures.put("budget", standardize(budget, budgetStats));
        userFeatures.put("travel_frequency", standardize(travelFrequency, frequencyStats));

        // Mã hóa đặc trưng phân loại
        Map<String, Object> encodedFeatures = encodeUserFeatures(userFeatures);

        return encodedFeatures;
    }

    // Tính khoảng cách đến trung tâm
    private double calculateDistanceToCenter(Location loc) {
        Map<String, double[]> cityCenters = Map.of(
                "Hồ Chí Minh", new double[]{10.7769, 106.7009},
                "Hà Nội", new double[]{21.0285, 105.8542},
                "Đà Nẵng", new double[]{16.0678, 108.2208},
                "Nha Trang", new double[]{12.2388, 109.1967}
        );
        if (loc == null || loc.getLatitude() == null || loc.getLongitude() == null) {
            return 10.0; // Giá trị mặc định
        }
        String city = loc.getCity() != null ? loc.getCity() : "Unknown";
        double[] center = cityCenters.getOrDefault(city, new double[]{0.0, 0.0});
        try {
            GeodeticCalculator calc = new GeodeticCalculator();
            calc.setStartingGeographicPoint(loc.getLongitude(), loc.getLatitude()); // (lon, lat)
            calc.setDestinationGeographicPoint(center[1], center[0]); // (lon, lat)

            double distanceInMeters = calc.getOrthodromicDistance(); // mét
            return distanceInMeters / 1000.0; // chuyển thành km
        } catch (Exception e) {
            return 10.0;
        }
    }

    // Lấy top amenities
    private Set<String> getTopAmenities(List<Accommodation> accommodations, int topN) {
        Map<String, Integer> amenityCounts = new HashMap<>();
        for (Accommodation acc : accommodations) {
            for (Amenity amenity : acc.getAmenities()) {
                String name = amenity.getName().toLowerCase();
                amenityCounts.put(name, amenityCounts.getOrDefault(name, 0) + 1);
            }
        }
        return amenityCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(topN)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    // Chuẩn hóa giá trị
    private double standardize(double value, DescriptiveStatistics stats) {
        double mean = stats.getMean();
        double std = stats.getStandardDeviation();
        return std > 0 ? (value - mean) / std : 0.0;
    }

    // Mã hóa đặc trưng chỗ ở
    private Map<String, Object> encodeAccommodationFeatures(List<Map<String, Object>> accommodationFeatures, Set<String> topAmenities) {
        Set<String> locations = accommodationFeatures.stream()
                .map(f -> (String) f.get("location_parsed"))
                .collect(Collectors.toSet());
        Set<String> types = accommodationFeatures.stream()
                .map(f -> (String) f.get("property_type"))
                .collect(Collectors.toSet());

        List<Map<String, Object>> encodedFeatures = new ArrayList<>();
        List<String> itemFeatureCols = new ArrayList<>(Arrays.asList("log_price", "rating_cleaned", "log_distance"));

        // Thêm cột one-hot cho vị trí
        for (String loc : locations) {
            itemFeatureCols.add("loc_" + loc);
        }
        // Thêm cột one-hot cho loại
        for (String type : types) {
            itemFeatureCols.add("type_" + type);
        }
        // Thêm cột multi-label cho tiện nghi
        for (String amenity : topAmenities) {
            itemFeatureCols.add("amenity_" + amenity);
        }

        for (Map<String, Object> features : accommodationFeatures) {
            Map<String, Object> encoded = new HashMap<>();
            encoded.put("accommodation_id", features.get("accommodation_id"));
            encoded.put("log_price", features.get("log_price"));
            encoded.put("rating_cleaned", features.get("rating_cleaned"));
            encoded.put("log_distance", features.get("log_distance"));

            // Mã hóa vị trí
            String location = (String) features.get("location_parsed");
            for (String loc : locations) {
                encoded.put("loc_" + loc, loc.equals(location) ? 1.0 : 0.0);
            }

            // Mã hóa loại
            String type = (String) features.get("property_type");
            for (String t : types) {
                encoded.put("type_" + t, t.equals(type) ? 1.0 : 0.0);
            }

            // Mã hóa tiện nghi
            List<String> amenities = (List<String>) features.get("amenities_filtered");
            for (String amenity : topAmenities) {
                encoded.put("amenity_" + amenity, amenities.contains(amenity) ? 1.0 : 0.0);
            }

            encodedFeatures.add(encoded);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("features", encodedFeatures);
        result.put("item_feature_cols", itemFeatureCols);
        return result;
    }

    // Mã hóa đặc trưng người dùng
    private Map<String, Object> encodeUserFeatures(Map<String, Object> userFeatures) {
        Set<String> locations = userRepository.findAll().stream()
                .flatMap(u -> preferenceRepository.findByUserEntity_UserId(u.getUserId()).stream())
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.LOCATION)
                .map(Preference::getValue)
                .collect(Collectors.toSet());
        Set<String> types = Arrays.stream(Accommodation.AccommodationType.values())
                .map(Enum::toString)
                .collect(Collectors.toSet());
        Set<String> amenities = amenityRepository.findAll().stream()
                .map(Amenity::getName)
                .collect(Collectors.toSet());

        Map<String, Object> encoded = new HashMap<>();
        encoded.put("user_id", userFeatures.get("user_id"));
        encoded.put("budget", userFeatures.get("budget"));
        encoded.put("travel_frequency", userFeatures.get("travel_frequency"));

        // Mã hóa vị trí
        String location = (String) userFeatures.get("location");
        for (String loc : locations) {
            encoded.put("loc_" + loc, loc.equals(location) ? 1.0 : 0.0);
        }

        // Mã hóa loại
        String type = (String) userFeatures.get("property_type");
        for (String t : types) {
            encoded.put("type_" + t, t.equals(type) ? 1.0 : 0.0);
        }

        // Mã hóa tiện nghi
        List<String> userAmenities = (List<String>) userFeatures.get("amenities");
        for (String amenity : amenities) {
            encoded.put("amenity_" + amenity, userAmenities.contains(amenity) ? 1.0 : 0.0);
        }

        List<String> userFeatureCols = new ArrayList<>(Arrays.asList("budget", "travel_frequency"));
        userFeatureCols.addAll(locations.stream().map(loc -> "loc_" + loc).collect(Collectors.toList()));
        userFeatureCols.addAll(types.stream().map(t -> "type_" + t).collect(Collectors.toList()));
        userFeatureCols.addAll(amenities.stream().map(a -> "amenity_" + a).collect(Collectors.toList()));

        Map<String, Object> result = new HashMap<>();
        result.put("features", encoded);
        result.put("user_feature_cols", userFeatureCols);
        return result;
    }

    // Thống kê ngân sách
    private DescriptiveStatistics getBudgetStatistics() {
        DescriptiveStatistics stats = new DescriptiveStatistics();
        List<Preference> pricePrefs = preferenceRepository.findAll().stream()
                .filter(p -> p.getPreferenceType() == Preference.PreferenceType.PRICE)
                .collect(Collectors.toList());
        for (Preference pref : pricePrefs) {
            stats.addValue(parsePrice(pref.getValue()));
        }
        if (stats.getN() == 0) {
            stats.addValue(100.0);
        }
        return stats;
    }

    // Phân tích giá
    private double parsePrice(String priceStr) {
        try {
            return Double.parseDouble(priceStr.replaceAll("[^0-9.]", ""));
        } catch (NumberFormatException e) {
            return 100.0;
        }
    }
}