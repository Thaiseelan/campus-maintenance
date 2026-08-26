package com.bit.maintenance.dto.complaint;

import com.bit.maintenance.dto.location.LocationResponse;
import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import com.bit.maintenance.model.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private ComplaintCategory category;
    private Priority priority;
    private ComplaintStatus status;
    private LocationResponse location;
    private ReporterInfo reportedBy;
    private TechnicianInfo assignedTechnician; // null until Phase 5 assigns one
    private String photoUrl; // null if no issue photo was uploaded
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @AllArgsConstructor
    public static class ReporterInfo {
        private Long id;
        private String name;
    }

    @Getter
    @AllArgsConstructor
    public static class TechnicianInfo {
        private Long id;
        private String name;
    }
}
