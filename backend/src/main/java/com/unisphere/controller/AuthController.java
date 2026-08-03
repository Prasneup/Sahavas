package com.unisphere.controller;

import com.unisphere.dto.AuthResponse;
import com.unisphere.dto.LoginRequest;
import com.unisphere.dto.SignupRequest;
import com.unisphere.model.User;
import com.unisphere.security.TokenBlacklistService;
import com.unisphere.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService blacklistService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        User user = authService.registerStudent(signupRequest);
        return ResponseEntity.ok("User registered successfully. Status: " + user.getStatus());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        String jwt = getJwtFromRequest(request);
        if (StringUtils.hasText(jwt)) {
            // Blacklist the token for 15 minutes (its lifetime)
            blacklistService.blacklistToken(jwt, 900000);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
