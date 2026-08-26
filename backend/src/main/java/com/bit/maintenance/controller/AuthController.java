package com.bit.maintenance.controller;

import com.bit.maintenance.dto.auth.AuthResponse;
import com.bit.maintenance.dto.auth.LoginRequest;
import com.bit.maintenance.dto.auth.RegisterRequest;
import com.bit.maintenance.dto.auth.UserResponse;
import com.bit.maintenance.security.CustomUserDetails;
import com.bit.maintenance.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(UserResponse.from(principal.getUser()));
    }

    // JWT is stateless - there's nothing to invalidate server-side. This exists
    // purely so the frontend's logout call gets a clean 200 instead of a 404;
    // the actual "logout" is the frontend deleting its stored token.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    // Admin-only - used to provision Technician (and Staff/Admin) accounts
    // that shouldn't go through public self-registration.
    @PostMapping("/admin/create-user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerByAdmin(request));
    }
}
