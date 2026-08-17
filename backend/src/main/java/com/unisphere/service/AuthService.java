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
        if (request.getPhoneNumber() == null || !request.getPhoneNumber().matches("^(98|97)\\d{8}$")) {
            throw new IllegalArgumentException("Phone number must contain exactly 10 digits and start with 97 or 98");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number is already in use");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
        }

        String rawRole = request.getRole() != null ? request.getRole() : "student";
        if (rawRole.toUpperCase().contains("ADMIN")) {
            throw new IllegalArgumentException("Admin registration is not allowed.");
        }
        String dbRole = "student";
        if (rawRole.toUpperCase().contains("LANDLORD") || rawRole.toUpperCase().contains("OWNER")) {
            dbRole = "owner";
        }


        // Validate student specific fields
        if ("student".equals(dbRole)) {
            if (request.getCollegeId() == null) {
                throw new IllegalArgumentException("College selection is required for students");
            }
            if (request.getMajorCourse() == null || request.getMajorCourse().isBlank()) {
                throw new IllegalArgumentException("Major course is required for students");
            }
            if (request.getAcademicYear() == null) {
                throw new IllegalArgumentException("Academic year is required for students");
            }
        }

        User user = User.builder()
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(dbRole)
                .status("pending_verification")
                .build();

        User savedUser = userRepository.save(user);

        College college = null;
        if ("student".equals(dbRole) && request.getCollegeId() != null) {
            college = collegeRepository.findById(request.getCollegeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid college selection"));
        }

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .gender(request.getGender())
                .college(college)
                .majorCourse("student".equals(dbRole) ? request.getMajorCourse() : "Landlord")
                .academicYear("student".equals(dbRole) ? request.getAcademicYear() : 1)
                .hometownDistrict(request.getHometownDistrict())
                .currentCity(request.getCurrentCity())
                .verificationStatus("UNVERIFIED")
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

        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
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

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            java.util.UUID userId = tokenProvider.getUserIdFromJWT(refreshToken);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if ("suspended".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalArgumentException("Your account has been suspended.");
            }
            
            UserPrincipal principal = new UserPrincipal(user);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal, null, principal.getAuthorities());
            
            String newAccessToken = tokenProvider.generateAccessToken(authentication);
            String newRefreshToken = tokenProvider.generateRefreshToken(userId);
            
            String fullName = principal.getUsername();
            var profileOpt = studentProfileRepository.findById(user.getId());
            if (profileOpt.isPresent()) {
                fullName = profileOpt.get().getFullName();
            }
            
            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresInMs(900000)
                    .user(AuthResponse.UserDto.builder()
                            .id(user.getId())
                            .phoneNumber(user.getPhoneNumber())
                            .role(user.getRole())
                            .status(user.getStatus())
                            .fullName(fullName)
                            .build())
                    .build();
        } else {
            throw new IllegalArgumentException("Invalid refresh token");
        }
    }
}
