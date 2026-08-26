package com.bit.maintenance.dto.complaint;

import com.bit.maintenance.model.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {

    @NotNull
    private ComplaintStatus status;

    private String remarks;
}
