package com.bit.maintenance.service;

import com.bit.maintenance.dto.auth.UserResponse;
import com.bit.maintenance.dto.user.UpdateProfileRequest;
import com.bit.maintenance.exception.ApiException;
import com.bit.maintenance.model.User;
import com.bit.maintenance.model.enums.Role;
import com.bit.maintenance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /** Admin search by name/email, optionally narrowed to one role (e.g. finding
     *  TECHNICIAN accounts to attach a technician profile to). */
    public List<UserResponse> search(String query, Role role) {
        String q = query == null ? "" : query;

        List<User> results = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);

        return results.stream()
                .filter(u -> role == null || u.getRole() == role)
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public UserResponse updateOwnProfile(User currentUser, UpdateProfileRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        return UserResponse.from(userRepository.save(user));
    }
}
