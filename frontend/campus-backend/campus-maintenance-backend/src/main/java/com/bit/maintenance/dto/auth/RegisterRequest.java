package com.bit.maintenance.dto.auth;

import com.bit.maintenance.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Public /register only accepts STUDENT/STAFF here - enforced in
    // AuthService, not left to the client to self-report honestly.
    @NotNull
    private Role role;

    private String department;

    @JsonProperty("phone")
    private String phoneNumber;
}
