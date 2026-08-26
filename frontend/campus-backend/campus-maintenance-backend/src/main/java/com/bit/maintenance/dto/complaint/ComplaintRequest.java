package com.bit.maintenance.dto.complaint;

import com.bit.maintenance.model.enums.ComplaintCategory;
import com.bit.maintenance.model.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ComplaintRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private ComplaintCategory category;

    // Optional - service defaults to MEDIUM if not sent
    private Priority priority;

    @NotNull
    private Long locationId;
}
