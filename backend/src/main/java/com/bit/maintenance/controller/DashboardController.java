package com.bit.maintenance.controller;

import com.bit.maintenance.dto.dashboard.DashboardStatsResponse;
import com.bit.maintenance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsResponse stats() {
        return dashboardService.getStats();
    }
}
