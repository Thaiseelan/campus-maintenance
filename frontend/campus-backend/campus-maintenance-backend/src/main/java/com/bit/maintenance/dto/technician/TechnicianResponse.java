package com.bit.maintenance.dto.technician;

import com.bit.maintenance.model.Technician;
import com.bit.maintenance.model.enums.AvailabilityStatus;
import com.bit.maintenance.model.enums.TechnicianSpecialization;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TechnicianResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private TechnicianSpecialization specialization;
    private AvailabilityStatus availabilityStatus;
    private long activeTaskCount;

    public static TechnicianResponse from(Technician technician, long activeTaskCount) {
        return new TechnicianResponse(
                technician.getId(),
                technician.getUser().getId(),
                technician.getUser().getName(),
                technician.getUser().getEmail(),
                technician.getSpecialization(),
                technician.getAvailabilityStatus(),
                activeTaskCount
        );
    }
}
