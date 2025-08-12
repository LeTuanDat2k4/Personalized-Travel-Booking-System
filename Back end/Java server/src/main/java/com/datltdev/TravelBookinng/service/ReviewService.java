package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.entity.Review;
import com.datltdev.TravelBookinng.model.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {
    public ReviewDTO createReview(ReviewDTO review, Long accommodationId);
    public ReviewDTO updateReview(Long reviewId, ReviewDTO updatedReview);
    public void deleteReview(Long reviewId);
    public List<ReviewDTO> getReviewsByAccommodation(Long accommodationId);
    public List<ReviewDTO> getReviewsByUser(Long userId);
}
