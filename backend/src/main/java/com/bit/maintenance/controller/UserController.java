package com.bit.maintenance.controller;

import com.bit.maintenance.dto.auth.UserResponse;
import com.bit.maintenance.dto.user.UpdateProfileRequest;
import com.bit.maintenance.model.enums.Role;
import com.bit.maintenance.security.CustomUserDetails;
import com.bit.maintenance.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public List<UserResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Role role) {
        return userService.search(query, role);
    }

    @PatchMapping("/me")
    public UserResponse updateOwnProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return userService.updateOwnProfile(principal.getUser(), request);
    }
}
