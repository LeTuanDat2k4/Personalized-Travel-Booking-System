package com.datltdev.TravelBookinng.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Booking")
@Getter
@Setter
public class Booking extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userEntity;

    @ManyToOne
    @JoinColumn(name = "accommodation_id", nullable = false)
    private Accommodation accommodation;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "total_price", nullable = false, precision = 10)
    private Double totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "numofadults")
    @Min(value = 1, message = "Number of adults must not be less than 1")
    private Integer numOfAdults;

    @Column(name = "numofchildren")
    @Min(value = 0, message = "Number of children must not be less than 0")
    private Integer numOfChildren;

    @Column(name = "totalofguest")
    private Integer totalOfGuest;

    @Column(name = "bookingconfirmationcode")
    private String bookingConfirmationCode;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED
    }

    public void calculateTotalOfGuest() {
        this.totalOfGuest = this.numOfAdults + this.numOfChildren;
    }

    public void setNumOfAdults(Integer numOfAdults) {
        this.numOfAdults = numOfAdults;
        if (this.numOfChildren != null) {
            calculateTotalOfGuest();
        }
    }

    public void setNumOfChildren(Integer numOfChildren) {
        this.numOfChildren = numOfChildren;
        if (this.numOfAdults != null) {
            calculateTotalOfGuest();
        }
    }

}