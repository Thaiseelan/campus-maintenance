package com.bit.maintenance.controller;

import com.bit.maintenance.dto.complaint.AssignTechnicianRequest;
import com.bit.maintenance.dto.complaint.ComplaintRequest;
import com.bit.maintenance.dto.complaint.ComplaintResponse;
import com.bit.maintenance.dto.complaint.StatusHistoryResponse;
import com.bit.maintenance.dto.complaint.StatusUpdateRequest;
import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import com.bit.maintenance.security.CustomUserDetails;
import com.bit.maintenance.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ComplaintResponse> submit(
            @Valid @ModelAttribute ComplaintRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal CustomUserDetails principal) {

        ComplaintResponse response = complaintService.submit(request, image, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Admin - every complaint in the system. */
    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> listAll(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category) {

        return ResponseEntity.ok(complaintService.listAll(status, category));
    }

    /** Student/staff (or anyone) - complaints the current user reported. */
    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> listMine(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.listMine(principal.getUser(), status, category));
    }

    /** Technician - complaints currently assigned to them. */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<ComplaintResponse>> myTasks(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(complaintService.listForTechnician(principal.getUser()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.getById(id, principal.getUser()));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryResponse>> getHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.getHistory(id, principal.getUser()));
    }

    /** Technician only - moves ASSIGNED -> IN_PROGRESS or IN_PROGRESS -> RESOLVED. */
    @PatchMapping(value = "/{id}/status", consumes = "multipart/form-data")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @ModelAttribute StatusUpdateRequest request,
            @RequestParam(value = "completionImage", required = false) MultipartFile completionImage,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.updateStatus(id, request, completionImage, principal.getUser()));
    }

    /** Owner or admin - closes a RESOLVED complaint. */
    @PutMapping("/{id}/close")
    public ResponseEntity<ComplaintResponse> close(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.close(id, principal.getUser()));
    }

    /** Admin only - manually assigns an OPEN complaint auto-assignment couldn't place. */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponse> assign(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(complaintService.assignManually(id, request.getTechnicianId(), principal.getUser()));
    }
}
