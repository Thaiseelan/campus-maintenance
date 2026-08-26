package com.bit.maintenance.dto.complaint;

import com.bit.maintenance.model.StatusHistory;
import com.bit.maintenance.model.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class StatusHistoryResponse {
    private ComplaintStatus status;
    private String changedByName; // "System" for automated transitions with no human actor
    private String remarks;
    private LocalDateTime changedAt;

    public static StatusHistoryResponse from(StatusHistory history) {
        return new StatusHistoryResponse(
                history.getStatus(),
                history.getChangedBy() != null ? history.getChangedBy().getName() : "System",
                history.getRemarks(),
                history.getChangedAt()
        );
    }
}
