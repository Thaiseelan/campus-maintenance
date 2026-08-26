package com.bit.maintenance.repository;

import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.enums.AvailabilityStatus;
import com.bit.maintenance.model.enums.TechnicianSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    List<Technician> findBySpecializationAndAvailabilityStatus(
            TechnicianSpecialization specialization, AvailabilityStatus availabilityStatus);
    Optional<Technician> findByUserId(Long userId);
}
