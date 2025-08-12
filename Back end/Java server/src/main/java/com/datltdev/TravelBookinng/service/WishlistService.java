package com.datltdev.TravelBookinng.service;

import com.datltdev.TravelBookinng.entity.Wishlist;
import com.datltdev.TravelBookinng.model.dto.WishListDTO;

import java.util.List;

public interface WishlistService {
    public WishListDTO addToWishlist(Long accommodationId);
    public List<WishListDTO> getUserWishlist();
    public void removeFromWishlist(Long accommodationId);
}
