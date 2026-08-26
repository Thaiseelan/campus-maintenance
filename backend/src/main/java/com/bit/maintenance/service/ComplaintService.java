package com.bit.maintenance.service;

import com.bit.maintenance.dto.complaint.ComplaintRequest;
import com.bit.maintenance.dto.complaint.ComplaintResponse;
import com.bit.maintenance.dto.complaint.StatusHistoryResponse;
import com.bit.maintenance.dto.complaint.StatusUpdateRequest;
import com.bit.maintenance.dto.location.LocationResponse;
import com.bit.maintenance.exception.ApiException;
import com.bit.maintenance.model.Assignment;
import com.bit.maintenance.model.Attachment;
import com.bit.maintenance.model.Complaint;
import com.bit.maintenance.model.Location;
import com.bit.maintenance.model.StatusHistory;
import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.AttachmentType;
import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import com.bit.maintenance.model.enums.Priority;
import com.bit.maintenance.model.enums.Role;
import com.bit.maintenance.repository.AssignmentRepository;
import com.bit.maintenance.repository.AttachmentRepository;
import com.bit.maintenance.repository.ComplaintRepository;
import com.bit.maintenance.repository.LocationRepository;
import com.bit.maintenance.repository.StatusHistoryRepository;
import com.bit.maintenance.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final LocationRepository locationRepository;
    private final AttachmentRepository attachmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AssignmentRepository assignmentRepository;
    private final TechnicianRepository technicianRepository;
    private final FileStorageService fileStorageService;
    private final AssignmentService assignmentService;
    private final NotificationService notificationService;

    @Transactional
    public ComplaintResponse submit(ComplaintRequest request, MultipartFile image, User currentUser) {
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ApiException("Selected location does not exist", HttpStatus.BAD_REQUEST));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(ComplaintStatus.OPEN)
                .reportedBy(currentUser)
                .location(location)
                .build();

        Complaint saved = complaintRepository.save(complaint);

        String photoPath = fileStorageService.store(image);
        if (photoPath != null) {
            attachmentRepository.save(Attachment.builder()
                    .complaint(saved)
                    .filePath(photoPath)
                    .attachmentType(AttachmentType.ISSUE_PHOTO)
                    .uploadedBy(currentUser)
                    .build());
        }

        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(saved)
                .status(ComplaintStatus.OPEN)
                .changedBy(currentUser)
                .remarks("Complaint submitted")
                .build());

        // Tries to find a free matching technician and moves this straight to
        // ASSIGNED. If nobody's free, it silently stays OPEN - an admin can
        // assign manually later via assignManually().
        assignmentService.attemptAutoAssign(saved);

        notificationService.notifyComplaintSubmitted(saved);

        return toResponse(saved);
    }

    /** Admin view - every complaint in the system. */
    public List<ComplaintResponse> listAll(ComplaintStatus status, ComplaintCategory category) {
        return complaintRepository.findAll().stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> category == null || c.getCategory() == category)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Current user's own reported complaints (student/staff view). */
    public List<ComplaintResponse> listMine(User currentUser, ComplaintStatus status, ComplaintCategory category) {
        return complaintRepository.findByReportedBy(currentUser).stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> category == null || c.getCategory() == category)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Current technician's assigned tasks. */
    public List<ComplaintResponse> listForTechnician(User technicianUser) {
        Technician technician = technicianRepository.findByUserId(technicianUser.getId())
                .orElseThrow(() -> new ApiException("No technician profile is linked to this account", HttpStatus.NOT_FOUND));

        return assignmentRepository.findByTechnician(technician).stream()
                .map(a -> toResponse(a.getComplaint()))
                .collect(Collectors.toList());
    }

    public ComplaintResponse getById(Long id, User currentUser) {
        Complaint complaint = findComplaintOrThrow(id);
        assertCanView(complaint, currentUser);
        return toResponse(complaint);
    }

    public List<StatusHistoryResponse> getHistory(Long id, User currentUser) {
        Complaint complaint = findComplaintOrThrow(id);
        assertCanView(complaint, currentUser);
        return statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(id).stream()
                .map(StatusHistoryResponse::from)
                .collect(Collectors.toList());
    }

    /** Technician moves ASSIGNED -> IN_PROGRESS or IN_PROGRESS -> RESOLVED. */
    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request, MultipartFile completionImage, User currentUser) {
        Complaint complaint = findComplaintOrThrow(id);

        Assignment assignment = assignmentRepository.findByComplaintId(id)
                .orElseThrow(() -> new ApiException("This complaint has no technician assigned yet", HttpStatus.CONFLICT));

        if (!assignment.getTechnician().getUser().getId().equals(currentUser.getId())) {
            throw new ApiException("You are not the technician assigned to this complaint", HttpStatus.FORBIDDEN);
        }

        ComplaintStatus current = complaint.getStatus();
        ComplaintStatus target = request.getStatus();

        boolean validTransition =
                (current == ComplaintStatus.ASSIGNED && target == ComplaintStatus.IN_PROGRESS) ||
                (current == ComplaintStatus.IN_PROGRESS && target == ComplaintStatus.RESOLVED);

        if (!validTransition) {
            throw new ApiException("Cannot move a complaint from " + current + " to " + target, HttpStatus.BAD_REQUEST);
        }

        complaint.setStatus(target);
        complaintRepository.save(complaint);

        if (target == ComplaintStatus.RESOLVED) {
            assignment.setCompletedAt(LocalDateTime.now());
            assignmentRepository.save(assignment);

            String photoPath = fileStorageService.store(completionImage);
            if (photoPath != null) {
                attachmentRepository.save(Attachment.builder()
                        .complaint(complaint)
                        .filePath(photoPath)
                        .attachmentType(AttachmentType.COMPLETION_PHOTO)
                        .uploadedBy(currentUser)
                        .build());
            }
        }

        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .status(target)
                .changedBy(currentUser)
                .remarks(request.getRemarks())
                .build());

        if (target == ComplaintStatus.IN_PROGRESS) {
            notificationService.notifyWorkStarted(complaint);
        } else {
            notificationService.notifyIssueResolved(complaint);
        }

        return toResponse(complaint);
    }

    /** Owner or admin closes a RESOLVED complaint. */
    @Transactional
    public ComplaintResponse close(Long id, User currentUser) {
        Complaint complaint = findComplaintOrThrow(id);

        boolean isOwner = complaint.getReportedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ApiException("Only the reporter or an admin can close this complaint", HttpStatus.FORBIDDEN);
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new ApiException("Only a RESOLVED complaint can be closed", HttpStatus.BAD_REQUEST);
        }

        complaint.setStatus(ComplaintStatus.CLOSED);
        complaintRepository.save(complaint);

        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .status(ComplaintStatus.CLOSED)
                .changedBy(currentUser)
                .remarks("Closed by " + currentUser.getName())
                .build());

        notificationService.notifyComplaintClosed(complaint);

        return toResponse(complaint);
    }

    /** Admin manually assigns an OPEN complaint that auto-assignment couldn't place. */
    @Transactional
    public ComplaintResponse assignManually(Long id, Long technicianId, User admin) {
        Complaint complaint = findComplaintOrThrow(id);

        if (complaint.getStatus() != ComplaintStatus.OPEN) {
            throw new ApiException("Only an OPEN complaint can be assigned", HttpStatus.BAD_REQUEST);
        }

        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ApiException("Technician not found", HttpStatus.NOT_FOUND));

        assignmentService.manualAssign(complaint, technician, admin.getName());

        return toResponse(complaint);
    }

    private Complaint findComplaintOrThrow(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException("Complaint not found", HttpStatus.NOT_FOUND));
    }

    private void assertCanView(Complaint complaint, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (complaint.getReportedBy().getId().equals(user.getId())) {
            return;
        }
        if (user.getRole() == Role.TECHNICIAN) {
            boolean isAssignedTechnician = assignmentRepository.findByComplaintId(complaint.getId())
                    .map(a -> a.getTechnician().getUser().getId().equals(user.getId()))
                    .orElse(false);
            if (isAssignedTechnician) {
                return;
            }
        }
        throw new ApiException("You don't have access to this complaint", HttpStatus.FORBIDDEN);
    }

    private ComplaintResponse toResponse(Complaint complaint) {
        String photoUrl = attachmentRepository.findByComplaintId(complaint.getId()).stream()
                .filter(a -> a.getAttachmentType() == AttachmentType.ISSUE_PHOTO)
                .map(Attachment::getFilePath)
                .findFirst()
                .orElse(null);

        ComplaintResponse.TechnicianInfo technicianInfo = assignmentRepository.findByComplaintId(complaint.getId())
                .map(a -> new ComplaintResponse.TechnicianInfo(
                        a.getTechnician().getId(),
                        a.getTechnician().getUser().getName()))
                .orElse(null);

        return new ComplaintResponse(
                complaint.getId(),
                complaint.getTitle(),
                complaint.getDescription(),
                complaint.getCategory(),
                complaint.getPriority(),
                complaint.getStatus(),
                LocationResponse.from(complaint.getLocation()),
                new ComplaintResponse.ReporterInfo(complaint.getReportedBy().getId(), complaint.getReportedBy().getName()),
                technicianInfo,
                photoUrl,
                complaint.getCreatedAt(),
                complaint.getUpdatedAt()
        );
    }
}
