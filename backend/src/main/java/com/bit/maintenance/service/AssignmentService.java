package com.bit.maintenance.service;

import com.bit.maintenance.model.Assignment;
import com.bit.maintenance.model.Complaint;
import com.bit.maintenance.model.StatusHistory;
import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.enums.AvailabilityStatus;
import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import com.bit.maintenance.model.enums.TechnicianSpecialization;
import com.bit.maintenance.repository.AssignmentRepository;
import com.bit.maintenance.repository.ComplaintRepository;
import com.bit.maintenance.repository.StatusHistoryRepository;
import com.bit.maintenance.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

// Deliberately rule-based, not ML: category -> specialization -> availability
// -> lowest current workload as a tie-break. Matches the project's own scope
// decision to keep this a legitimate algorithmic component without pulling
// in AI/ML that isn't needed for a 10-week academic project.
@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final TechnicianRepository technicianRepository;
    private final AssignmentRepository assignmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationService notificationService;

    private static final Map<ComplaintCategory, TechnicianSpecialization> CATEGORY_MAP =
            new EnumMap<>(ComplaintCategory.class);

    static {
        CATEGORY_MAP.put(ComplaintCategory.ELECTRICAL, TechnicianSpecialization.ELECTRICAL);
        CATEGORY_MAP.put(ComplaintCategory.PLUMBING, TechnicianSpecialization.PLUMBING);
        CATEGORY_MAP.put(ComplaintCategory.NETWORK, TechnicianSpecialization.NETWORK);
        CATEGORY_MAP.put(ComplaintCategory.FURNITURE, TechnicianSpecialization.CARPENTRY_FURNITURE);
        CATEGORY_MAP.put(ComplaintCategory.CIVIL, TechnicianSpecialization.CIVIL_MAINTENANCE);
        CATEGORY_MAP.put(ComplaintCategory.CLEANING, TechnicianSpecialization.HOUSEKEEPING);
        CATEGORY_MAP.put(ComplaintCategory.OTHER, TechnicianSpecialization.GENERAL);
    }

    /** Called right after a complaint is submitted. Leaves it OPEN if nobody matching is free. */
    @Transactional
    public void attemptAutoAssign(Complaint complaint) {
        TechnicianSpecialization required = CATEGORY_MAP.get(complaint.getCategory());

        List<Technician> candidates = technicianRepository
                .findBySpecializationAndAvailabilityStatus(required, AvailabilityStatus.AVAILABLE);

        if (candidates.isEmpty()) {
            return;
        }

        Technician chosen = candidates.stream()
                .min(Comparator.comparingLong(assignmentRepository::countByTechnicianAndCompletedAtIsNull))
                .orElse(candidates.get(0));

        createAssignment(complaint, chosen, null);
    }

    /** Admin fallback for an OPEN complaint that auto-assignment couldn't place. */
    @Transactional
    public void manualAssign(Complaint complaint, Technician technician, String assignedByAdminName) {
        createAssignment(complaint, technician, assignedByAdminName);
    }

    private void createAssignment(Complaint complaint, Technician technician, String assignedByAdminName) {
        assignmentRepository.save(Assignment.builder()
                .complaint(complaint)
                .technician(technician)
                .build());

        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaintRepository.save(complaint);

        String remark = assignedByAdminName != null
                ? "Assigned to " + technician.getUser().getName() + " by " + assignedByAdminName
                : "Auto-assigned to " + technician.getUser().getName();

        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .status(ComplaintStatus.ASSIGNED)
                .remarks(remark)
                .build());

        notificationService.notifyTechnicianAssigned(complaint, technician);
    }
}
