package com.pradha.main.controller;

import com.pradha.main.dto.LoginRequest;
import com.pradha.main.dto.SignupRequest;
import com.pradha.main.dto.AuthResponse;
import com.pradha.main.entity.User;
import com.pradha.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.205.19.24:3000", "http://18.205.19.24", "http://18.205.19.24:8081"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already registered"));
        }

        User user = new User(
            request.getEmail(),
            request.getName(),
            request.getPhone(),
            passwordEncoder.encode(request.getPassword())
        );

        userRepository.save(user);

        String token = "temp-token-" + System.currentTimeMillis();
        return ResponseEntity.ok(new AuthResponse(
            token,
            "bearer",
            Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid credentials"));
        }

        String token = "temp-token-" + System.currentTimeMillis();
        return ResponseEntity.ok(new AuthResponse(
            token,
            "bearer",
            Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole())
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(Map.of(
            "id", "mock-user-id",
            "email", "user@example.com",
            "name", "Mock User",
            "role", "USER"
        ));
    }
}
