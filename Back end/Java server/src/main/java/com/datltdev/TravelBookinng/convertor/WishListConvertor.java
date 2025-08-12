package com.datltdev.TravelBookinng.convertor;

import com.datltdev.TravelBookinng.entity.Wishlist;
import com.datltdev.TravelBookinng.model.dto.AccommodationDTO;
import com.datltdev.TravelBookinng.model.dto.UserDTO;
import com.datltdev.TravelBookinng.model.dto.WishListDTO;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class WishListConvertor {
    @Autowired
    private ModelMapper modelMapper;

    public WishListDTO convertToWishListDTO(Wishlist wishlist) {
        WishListDTO wishListDTO = modelMapper.map(wishlist, WishListDTO.class);

        // Map UserEntity to UserDTO
        if (wishlist.getUserWishlist() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(wishlist.getUserWishlist().getUserId());
            userDTO.setUsername(wishlist.getUserWishlist().getUsername());
            userDTO.setEmail(wishlist.getUserWishlist().getEmail());
            userDTO.setRole(wishlist.getUserWishlist().getRole().name());
            wishListDTO.setUser(userDTO);
        }

        // Map Accommodation to AccommodationDTO
        if (wishlist.getAccommodationWishlist() != null) {
            AccommodationDTO accommodationDTO = new AccommodationDTO();
            accommodationDTO.setAccommodationId(wishlist.getAccommodationWishlist().getAccommodationId());
            accommodationDTO.setName(wishlist.getAccommodationWishlist().getName());
            accommodationDTO.setType(wishlist.getAccommodationWishlist().getType().name());
            accommodationDTO.setPricePerNight(wishlist.getAccommodationWishlist().getPricePerNight());
            accommodationDTO.setAvailability(wishlist.getAccommodationWishlist().getAvailability());
            accommodationDTO.setDescription(wishlist.getAccommodationWishlist().getDescription());
            accommodationDTO.setPhotoUrl(wishlist.getAccommodationWishlist().getPhotoUrl());
            wishListDTO.setAccommodation(accommodationDTO);
        }

        return wishListDTO;
    }

    public Wishlist convertToWishListEntity(WishListDTO wishListDTO) {
        return modelMapper.map(wishListDTO, Wishlist.class);
    }
}
