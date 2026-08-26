package com.bit.maintenance.repository;

import com.bit.maintenance.model.Assignment;
import com.bit.maintenance.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByComplaintId(Long complaintId);
    List<Assignment> findByTechnician(Technician technician);
    long countByTechnicianAndCompletedAtIsNull(Technician technician);
}
