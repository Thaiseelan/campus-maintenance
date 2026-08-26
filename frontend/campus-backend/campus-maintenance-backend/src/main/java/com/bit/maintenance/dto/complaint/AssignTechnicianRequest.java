package com.bit.maintenance.dto.complaint;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTechnicianRequest {

    @NotNull
    private Long technicianId;
}
