package com.bit.maintenance.service;

import com.bit.maintenance.dto.auth.AuthResponse;
import com.bit.maintenance.dto.auth.LoginRequest;
import com.bit.maintenance.dto.auth.RegisterRequest;
import com.bit.maintenance.dto.auth.UserResponse;
import com.bit.maintenance.exception.ApiException;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.Role;
import com.bit.maintenance.repository.UserRepository;
import com.bit.maintenance.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    /** Public self-registration - Student/Staff only. */
    public UserResponse register(RegisterRequest request) {
        if (request.getRole() != Role.STUDENT && request.getRole() != Role.STAFF) {
            throw new ApiException(
                    "Self-registration is only available for students and staff",
                    HttpStatus.FORBIDDEN
            );
        }
        return createAccount(request);
    }

    /** Admin-only provisioning - can create an account of any role (e.g. a Technician). */
    public UserResponse registerByAdmin(RegisterRequest request) {
        return createAccount(request);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Incorrect email or password", HttpStatus.UNAUTHORIZED));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, UserResponse.from(user));
    }

    private UserResponse createAccount(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(request.getDepartment())
                .phoneNumber(request.getPhoneNumber())
                .build();

        return UserResponse.from(userRepository.save(user));
    }
}
