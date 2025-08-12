package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Review;
import com.datltdev.TravelBookinng.model.dto.ReviewDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReviewConvertor {
    @Autowired
    private ModelMapper modelMapper;

    public ReviewDTO convertToReviewDTO(Review review) {
        ReviewDTO reviewDTO = modelMapper.map(review, ReviewDTO.class);
        if (review.getUserEntity() != null) {
            reviewDTO.setUserId(review.getUserEntity().getUserId());
            reviewDTO.setUsername(review.getUserEntity().getUsername());
        }
        if (review.getAccommodation() != null) {
            reviewDTO.setAccommodationId(review.getAccommodation().getAccommodationId());
        }
        return reviewDTO;
    }

    public Review convertToReviewEntity(ReviewDTO reviewDTO) {
        return modelMapper.map(reviewDTO, Review.class);
    }
}
