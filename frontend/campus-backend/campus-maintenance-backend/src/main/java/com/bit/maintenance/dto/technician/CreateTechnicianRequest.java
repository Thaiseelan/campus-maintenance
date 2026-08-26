package com.bit.maintenance.dto.technician;

import com.bit.maintenance.model.enums.TechnicianSpecialization;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTechnicianRequest {

    // Must already exist as a User with role=TECHNICIAN
    // (create that via POST /api/auth/admin/create-user first).
    @NotNull
    private Long userId;

    @NotNull
    private TechnicianSpecialization specialization;
}
