package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    Optional<Amenity> findByName(String name);
    boolean existsByName(String name);
    Optional<Amenity> findByNameIgnoreCase(String name);
}
