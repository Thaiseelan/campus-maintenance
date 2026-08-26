package com.bit.maintenance.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

// Deliberately NOT email/password/role - those need their own dedicated,
// more carefully-guarded flows, not a generic profile-update endpoint.
@Getter
@Setter
public class UpdateProfileRequest {
    private String name;
    private String department;

    @JsonProperty("phone")
    private String phoneNumber;
}
