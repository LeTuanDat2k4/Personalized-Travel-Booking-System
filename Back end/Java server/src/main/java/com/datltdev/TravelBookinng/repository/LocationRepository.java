package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

}
