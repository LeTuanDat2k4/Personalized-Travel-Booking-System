package com.datltdev.TravelBookinng.service.impl;

import com.datltdev.TravelBookinng.convertor.WishListConvertor;
import com.datltdev.TravelBookinng.entity.Accommodation;
import com.datltdev.TravelBookinng.entity.UserEntity;
import com.datltdev.TravelBookinng.entity.Wishlist;
import com.datltdev.TravelBookinng.model.dto.WishListDTO;
import com.datltdev.TravelBookinng.repository.AccommodationRepository;
import com.datltdev.TravelBookinng.repository.WishlistRepository;
import com.datltdev.TravelBookinng.service.WishlistService;
import com.datltdev.TravelBookinng.untils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class WishlistServiceImpl implements WishlistService {
    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private AccommodationRepository accommodationRepository;

    @Autowired
    private WishListConvertor wishListConvertor;

    @Transactional
    public WishListDTO addToWishlist(Long accommodationId) {
        UserEntity user = SecurityUtils.getPrincipal();
        Accommodation accommodation = accommodationRepository.findById(accommodationId)
                .orElseThrow(() -> new NoSuchElementException("Accommodation not found"));

        if (wishlistRepository.existsByUserWishlist_UserIdAndAccommodationWishlist_AccommodationId(
                user.getUserId(), accommodationId)) {
            throw new IllegalStateException("Accommodation already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUserWishlist(user);
        wishlist.setAccommodationWishlist(accommodation);
        wishlist.setCreatedAt(LocalDateTime.now());
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return wishListConvertor.convertToWishListDTO(savedWishlist);
    }

    public List<WishListDTO> getUserWishlist() {
        UserEntity user = SecurityUtils.getPrincipal();
        return wishlistRepository.findByUserWishlist_UserId(user.getUserId())
                .stream()
                .map(wishListConvertor::convertToWishListDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeFromWishlist(Long accommodationId) {
        UserEntity user = SecurityUtils.getPrincipal();
        Wishlist wishlist = wishlistRepository.findByUserWishlistUserIdAndAccommodationWishlistAccommodationId(
                        user.getUserId(), accommodationId)
                .orElseThrow(() -> new NoSuchElementException("Wishlist item not found"));

        wishlistRepository.delete(wishlist);
    }
}
