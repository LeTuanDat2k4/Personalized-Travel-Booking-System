package com.datltdev.TravelBookinng.repository;

import com.datltdev.TravelBookinng.entity.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    List<Preference> findByUserEntity_UserId(Long userId);
}
