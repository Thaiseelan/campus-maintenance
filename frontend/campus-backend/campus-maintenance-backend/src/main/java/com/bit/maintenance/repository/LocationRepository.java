package com.bit.maintenance.repository;

import com.bit.maintenance.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByBuilding(String building);
}
