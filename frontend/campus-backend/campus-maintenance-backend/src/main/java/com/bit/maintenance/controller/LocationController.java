package com.bit.maintenance.controller;

import com.bit.maintenance.dto.location.LocationResponse;
import com.bit.maintenance.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

// Simple enough (one read-only list, no business logic) that it talks to the
// repository directly rather than through a service layer.
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationRepository locationRepository;

    @GetMapping
    public List<LocationResponse> list() {
        return locationRepository.findAll().stream()
                .map(LocationResponse::from)
                .collect(Collectors.toList());
    }
}
