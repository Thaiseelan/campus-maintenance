package com.bit.maintenance.service;

import com.bit.maintenance.dto.dashboard.DashboardStatsResponse;
import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import com.bit.maintenance.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ComplaintRepository complaintRepository;

    public DashboardStatsResponse getStats() {
        Map<ComplaintStatus, Long> byStatus = new EnumMap<>(ComplaintStatus.class);
        for (ComplaintStatus status : ComplaintStatus.values()) {
            byStatus.put(status, complaintRepository.countByStatus(status));
        }

        Map<ComplaintCategory, Long> byCategory = new EnumMap<>(ComplaintCategory.class);
        for (ComplaintCategory category : ComplaintCategory.values()) {
            byCategory.put(category, complaintRepository.countByCategory(category));
        }

        long unresolved = byStatus.getOrDefault(ComplaintStatus.OPEN, 0L)
                + byStatus.getOrDefault(ComplaintStatus.ASSIGNED, 0L)
                + byStatus.getOrDefault(ComplaintStatus.IN_PROGRESS, 0L);

        return new DashboardStatsResponse(complaintRepository.count(), byStatus, byCategory, unresolved);
    }
}
