package com.bit.maintenance.controller;

import com.bit.maintenance.dto.technician.CreateTechnicianRequest;
import com.bit.maintenance.dto.technician.TechnicianResponse;
import com.bit.maintenance.dto.technician.UpdateTechnicianRequest;
import com.bit.maintenance.service.TechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @PostMapping
    public ResponseEntity<TechnicianResponse> create(@Valid @RequestBody CreateTechnicianRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<TechnicianResponse>> list() {
        return ResponseEntity.ok(technicianService.list());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TechnicianResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateTechnicianRequest request) {
        return ResponseEntity.ok(technicianService.update(id, request));
    }
}
