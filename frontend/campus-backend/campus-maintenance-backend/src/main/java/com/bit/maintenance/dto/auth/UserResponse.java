package com.bit.maintenance.dto.auth;

import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String department;

    // Java field stays phoneNumber (matches the User entity/DB column) but the
    // frontend's contract uses "phone" - @JsonProperty bridges the two without
    // touching the entity or requiring a DB migration.
    @JsonProperty("phone")
    private String phoneNumber;

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getPhoneNumber()
        );
    }
}
