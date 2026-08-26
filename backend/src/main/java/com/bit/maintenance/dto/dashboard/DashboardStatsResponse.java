package com.bit.maintenance.dto.dashboard;

import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalComplaints;
    private Map<ComplaintStatus, Long> byStatus;
    private Map<ComplaintCategory, Long> byCategory;
    private long unresolvedCount;
}
