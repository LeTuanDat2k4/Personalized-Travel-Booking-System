package com.datltdev.TravelBookinng.controller;

import com.datltdev.TravelBookinng.entity.Wishlist;
import com.datltdev.TravelBookinng.model.dto.WishListDTO;
import com.datltdev.TravelBookinng.model.response.ResponseDTO;
import com.datltdev.TravelBookinng.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @PostMapping("/accommodation/{accommodationId}")
    public ResponseEntity<ResponseDTO> addToWishlist(@PathVariable Long accommodationId) {
        ResponseDTO response = new ResponseDTO();
        try {
            WishListDTO wishlist = wishlistService.addToWishlist(accommodationId);
            response.setStatusCode(201);
            response.setMessage("Accommodation added to wishlist successfully");
            response.setData(wishlist);
        } catch (NoSuchElementException e) {
            response.setStatusCode(404);
            response.setMessage("Accommodation not found: " + e.getMessage());
        } catch (IllegalStateException e) {
            response.setStatusCode(409);
            response.setMessage("Accommodation already in wishlist: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding to wishlist: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getUserWishlist() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<WishListDTO> wishlist = wishlistService.getUserWishlist();
            response.setStatusCode(200);
            response.setMessage("Wishlist retrieved successfully");
            response.setData(wishlist);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error retrieving wishlist: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/accommodation/{accommodationId}")
    public ResponseEntity<ResponseDTO> removeFromWishlist(@PathVariable Long accommodationId) {
        ResponseDTO response = new ResponseDTO();
        try {
            wishlistService.removeFromWishlist(accommodationId);
            response.setStatusCode(200);
            response.setMessage("Accommodation removed from wishlist successfully");
            response.setData(null);
        } catch (NoSuchElementException e) {
            response.setStatusCode(404);
            response.setMessage("Wishlist item not found: " + e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error removing from wishlist: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
