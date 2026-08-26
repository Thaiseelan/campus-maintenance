package com.bit.maintenance.dto.technician;

import com.bit.maintenance.model.enums.AvailabilityStatus;
import com.bit.maintenance.model.enums.TechnicianSpecialization;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTechnicianRequest {
    private TechnicianSpecialization specialization;
    private AvailabilityStatus availabilityStatus;
}
