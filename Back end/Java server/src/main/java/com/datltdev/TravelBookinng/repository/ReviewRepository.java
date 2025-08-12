package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByAccommodationAccommodationId(Long accommodationId);
    List<Review> findByUserEntity_UserId(Long userId);
    boolean existsByUserEntityUserIdAndAccommodationAccommodationId(Long userId, Long accommodationId);
}
