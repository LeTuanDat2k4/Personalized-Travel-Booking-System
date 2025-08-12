package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.entity.Review;
import com.datltdev.TravelBookinng.model.dto.ReviewDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.ReviewService;
import com.datltdev.TravelBookinng.service.ReviewSummarizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private  ReviewSummarizationService reviewSummarizationService;

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/accommodation/{accommodationId}")
    public ResponseEntity<ResponseDTO> createReview(@PathVariable Long accommodationId, @RequestBody ReviewDTO review) {
        ResponseDTO response = new ResponseDTO();
        try {
            ReviewDTO createdReview = reviewService.createReview(review, accommodationId);
            response.setStatusCode(201);
            response.setMessage("Review created successfully");
            response.setData(createdReview);
        } catch (NoSuchElementException e) {
            response.setStatusCode(404);
            response.setMessage("Accommodation not found: " + e.getMessage());
        } catch (IllegalStateException e) {
            response.setStatusCode(409);
            response.setMessage("Review already exists: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            response.setStatusCode(400);
            response.setMessage("Invalid input: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating review: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/accommodation/{accommodationId}")
    public ResponseEntity<ResponseDTO> getReviewsByAccommodation(@PathVariable Long accommodationId) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByAccommodation(accommodationId);
            response.setStatusCode(200);
            response.setMessage("Reviews retrieved successfully");
            response.setData(reviews);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving reviews: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ResponseDTO> getReviewsByUser(@PathVariable Long userId) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByUser(userId);
            response.setStatusCode(200);
            response.setMessage("User reviews retrieved successfully");
            response.setData(reviews);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving user reviews: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ResponseDTO> updateReview(@PathVariable Long reviewId, @RequestBody ReviewDTO review) {
        ResponseDTO response = new ResponseDTO();
        try {
            ReviewDTO updatedReview = reviewService.updateReview(reviewId, review);
            response.setStatusCode(200);
            response.setMessage("Review updated successfully");
            response.setData(updatedReview);
        } catch (NoSuchElementException e) {
            response.setStatusCode(404);
            response.setMessage("Review not found: " + e.getMessage());
        } catch (SecurityException e) {
            response.setStatusCode(403);
            response.setMessage("Unauthorized: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            response.setStatusCode(400);
            response.setMessage("Invalid input: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating review: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ResponseDTO> deleteReview(@PathVariable Long reviewId) {
        ResponseDTO response = new ResponseDTO();
        try {
            reviewService.deleteReview(reviewId);
            response.setStatusCode(200);
            response.setMessage("Review deleted successfully");
            response.setData(null);
        } catch (NoSuchElementException e) {
            response.setStatusCode(404);
            response.setMessage("Review not found: " + e.getMessage());
        } catch (SecurityException e) {
            response.setStatusCode(403);
            response.setMessage("Unauthorized: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting review: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/summary/{accommodationId}")
    public ResponseEntity<ResponseDTO> getReviewSummary(@PathVariable Long accommodationId) {
        ResponseDTO response = new ResponseDTO();
        try {
            if (accommodationId == null || accommodationId <= 0) {
                response.setStatusCode(400);
                response.setMessage("Invalid accommodation ID");
                return ResponseEntity.status(400).body(response);
            }

            Map<String, Object> summaryData = reviewSummarizationService.getReviewSummary(accommodationId);
            if (summaryData.containsKey("error")) {
                response.setStatusCode(404);
                response.setMessage((String) summaryData.get("error"));
                return ResponseEntity.status(404).body(response);
            }

            // Update the database
            reviewSummarizationService.updateReviewSummary(accommodationId);

            response.setStatusCode(200);
            response.setMessage("Review summary generated successfully");
            response.setData(summaryData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error generating review summary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}
