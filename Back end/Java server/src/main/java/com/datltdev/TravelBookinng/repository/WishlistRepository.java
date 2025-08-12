package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserWishlist_UserId(Long userId);
    Optional<Wishlist> findByUserWishlistUserIdAndAccommodationWishlistAccommodationId(Long userId, Long accommodationId);
    boolean existsByUserWishlist_UserIdAndAccommodationWishlist_AccommodationId(Long userId, Long accommodationId);
}
