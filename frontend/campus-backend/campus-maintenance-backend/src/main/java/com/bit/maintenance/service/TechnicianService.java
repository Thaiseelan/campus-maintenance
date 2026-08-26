package com.bit.maintenance.service;

import com.bit.maintenance.dto.technician.CreateTechnicianRequest;
import com.bit.maintenance.dto.technician.TechnicianResponse;
import com.bit.maintenance.dto.technician.UpdateTechnicianRequest;
import com.bit.maintenance.exception.ApiException;
import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.Role;
import com.bit.maintenance.repository.AssignmentRepository;
import com.bit.maintenance.repository.TechnicianRepository;
import com.bit.maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;

    public TechnicianResponse create(CreateTechnicianRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.TECHNICIAN) {
            throw new ApiException("Only a user with role TECHNICIAN can get a technician profile", HttpStatus.BAD_REQUEST);
        }
        if (technicianRepository.findByUserId(user.getId()).isPresent()) {
            throw new ApiException("This user already has a technician profile", HttpStatus.CONFLICT);
        }

        Technician technician = Technician.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .build();

        return toResponse(technicianRepository.save(technician));
    }

    public List<TechnicianResponse> list() {
        return technicianRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TechnicianResponse update(Long id, UpdateTechnicianRequest request) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ApiException("Technician not found", HttpStatus.NOT_FOUND));

        if (request.getSpecialization() != null) {
            technician.setSpecialization(request.getSpecialization());
        }
        if (request.getAvailabilityStatus() != null) {
            technician.setAvailabilityStatus(request.getAvailabilityStatus());
        }

        return toResponse(technicianRepository.save(technician));
    }

    private TechnicianResponse toResponse(Technician technician) {
        long activeTasks = assignmentRepository.countByTechnicianAndCompletedAtIsNull(technician);
        return TechnicianResponse.from(technician, activeTasks);
    }
}
