package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Service
public class ReviewSummarizationService {
    private final WebClient webClient;
    private final AccommodationRepository accommodationRepository;

    @Autowired
    public ReviewSummarizationService(WebClient.Builder webClientBuilder, AccommodationRepository accommodationRepository) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:4000").build();
        this.accommodationRepository = accommodationRepository;
    }

    public Map<String, Object> getReviewSummary(Long accommodationId) {
        try {
            return webClient.get()
                    .uri("/summarize/{id}", accommodationId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            return Map.of("error", "No valid reviews found for accommodation ID " + accommodationId);
        }
    }

    public void updateReviewSummary(Long accommodationId) {
        Map<String, Object> summaryData = getReviewSummary(accommodationId);
        if (summaryData != null && !summaryData.containsKey("error")) {
            String summary = "Positive: " + summaryData.get("positive_summary") + "\nNegative: " + summaryData.get("negative_summary");
            Accommodation accommodation = accommodationRepository.findById(accommodationId)
                    .orElseThrow(() -> new RuntimeException("Accommodation not found"));
            accommodation.setReviewSummary(summary);
            accommodationRepository.save(accommodation);
        }
    }
}
