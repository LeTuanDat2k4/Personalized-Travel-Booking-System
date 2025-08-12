package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    List<Interaction> findByUser_UserId(Long userId);
    List<Interaction> findByUser_UserIdAndAccommodation_AccommodationId(Long userId, Long accommodationId);
}
