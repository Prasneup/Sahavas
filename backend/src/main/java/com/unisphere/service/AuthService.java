package com.unisphere.service;

import com.unisphere.dto.AuthResponse;
import com.unisphere.dto.LoginRequest;
import com.unisphere.dto.SignupRequest;
import com.unisphere.model.College;
import com.unisphere.model.StudentProfile;
import com.unisphere.model.User;
import com.unisphere.repository.CollegeRepository;
import com.unisphere.repository.StudentProfileRepository;
import com.unisphere.repository.UserRepository;
import com.unisphere.security.JwtTokenProvider;
import com.unisphere.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public User registerStudent(SignupRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number is already in use");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = User.builder()
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "ROLE_STUDENT")
                .status("PENDING_VERIFICATION")
                .build();

        User savedUser = userRepository.save(user);

        College college = null;
        if (request.getCollegeId() != null) {
            college = collegeRepository.findById(request.getCollegeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid college selection"));
        }

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .gender(request.getGender())
                .college(college)
                .majorCourse(request.getMajorCourse())
                .academicYear(request.getAcademicYear())
                .hometownDistrict(request.getHometownDistrict())
                .currentCity(request.getCurrentCity())
                .build();

        studentProfileRepository.save(profile);

        return savedUser;
    }

    public AuthResponse authenticateUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhoneNumber(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateAccessToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));

        String fullName = principal.getUsername();
        var profileOpt = studentProfileRepository.findById(user.getId());
        if (profileOpt.isPresent()) {
            fullName = profileOpt.get().getFullName();
        }

        return AuthResponse.builder()
                .accessToken(jwt)
                .expiresInMs(900000) // 15 mins
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .fullName(fullName)
                        .build())
                .build();
    }
}
