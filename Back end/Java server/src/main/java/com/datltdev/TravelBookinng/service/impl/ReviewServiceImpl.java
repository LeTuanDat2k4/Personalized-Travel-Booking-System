package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.ReviewConvertor;
import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.Review;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.model.dto.ReviewDTO;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import com.datltdev.TravelBookinng.repository.ReviewRepository;
import com.datltdev.TravelBookinng.repository.UserRepository;
import com.datltdev.TravelBookinng.service.ReviewService;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private ReviewConvertor reviewConvertor;

    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO, Long accommodationId) {
        UserEntity user = SecurityUtils.getPrincipal();
        Accommodation accommodation = accommodationRepository.findById(accommodationId)
                .orElseThrow(() -> new NoSuchElementException("Accommodation not found"));

        if (reviewRepository.existsByUserEntityUserIdAndAccommodationAccommodationId(user.getUserId(), accommodationId)) {
            throw new IllegalStateException("User has already reviewed this accommodation");
        }

        if (reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Review review = reviewConvertor.convertToReviewEntity(reviewDTO);
        review.setUserEntity(user);
        review.setAccommodation(accommodation);
        review.setCreatedAt(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);
        return reviewConvertor.convertToReviewDTO(savedReview);
    }

    public List<ReviewDTO> getReviewsByAccommodation(Long accommodationId) {
        return reviewRepository.findByAccommodationAccommodationId(accommodationId)
                .stream()
                .map(reviewConvertor::convertToReviewDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserEntity_UserId(userId)
                .stream()
                .map(reviewConvertor::convertToReviewDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO updateReview(Long reviewId, ReviewDTO updatedReviewDTO) {
        UserEntity user = SecurityUtils.getPrincipal();
        Review existingReview = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));

        if (!existingReview.getUserEntity().getUserId().equals(user.getUserId())) {
            throw new SecurityException("User not authorized to update this review");
        }

        if (updatedReviewDTO.getRating() < 1 || updatedReviewDTO.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        existingReview.setRating(updatedReviewDTO.getRating().byteValue());
        existingReview.setComment(updatedReviewDTO.getComment());
        existingReview.setUpdatedAt(LocalDateTime.now());
        Review updatedReview = reviewRepository.save(existingReview);
        return reviewConvertor.convertToReviewDTO(updatedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        UserEntity user = SecurityUtils.getPrincipal();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));

        if (!review.getUserEntity().getUserId().equals(user.getUserId())) {
            throw new SecurityException("User not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }
}
