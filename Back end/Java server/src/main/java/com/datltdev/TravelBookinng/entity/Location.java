package com.datltdev.TravelBookinng.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "Location")
public class Location extends BaseEntity {
    // Getters và Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long locationId;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Column(nullable = false, precision = 10)
    private Double latitude;

    @Column(nullable = false, precision = 11)
    private Double longitude;

    @OneToOne(mappedBy = "location")
    private Accommodation accommodation;

}