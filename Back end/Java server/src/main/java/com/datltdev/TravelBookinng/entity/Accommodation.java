package com.datltdev.TravelBookinng.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "Accommodation")
public class Accommodation extends BaseEntity {
    // Getters và Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "accommodation_id")
    private Long accommodationId;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private UserEntity owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "photourl")
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccommodationType type;

    @Column(name = "price_per_night", nullable = false, precision = 10)
    private Double pricePerNight;

    @Column(nullable = false)
    private Boolean availability = true;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "review_summary")
    private String reviewSummary;

    @OneToOne
    @JoinColumn(name = "location_id")
    private Location location;

    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Review> reviews;

    @OneToMany(mappedBy = "accommodation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Interaction> interactions;

    @OneToMany(mappedBy = "accommodationWishlist", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Wishlist> wishlists;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "Accommodation_Amenities",
            joinColumns = @JoinColumn(name = "accommodation_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private List<Amenity> amenities;

    public enum AccommodationType {
        HOTEL, APARTMENT, VILLA, HOSTEL
    }

}