package com.pradha.main.controller;

import com.pradha.main.dto.LoginRequest;
import com.pradha.main.dto.SignupRequest;
import com.pradha.main.dto.AuthResponse;
import com.pradha.main.entity.User;
import com.pradha.main.repository.UserRepository;
import com.pradha.main.security.JwtUtil;
import com.pradha.main.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.205.19.24:3000", "http://18.205.19.24", "http://18.205.19.24:8081"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${google.client.id:}")
    private String googleClientId;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "This email is already registered. Please try with a different email address or login if you already have an account."));
        }

        User user = new User(
            request.getEmail(),
            request.getName(),
            request.getPhone(),
            passwordEncoder.encode(request.getPassword())
        );
        
        // Generate OTP for email verification
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        user.setEmailVerified(false);

        userRepository.save(user);
        
        try {
            emailService.sendOTP(request.getEmail(), otp);
            return ResponseEntity.ok(Map.of(
                "message", "Account created. Please check your email for OTP verification.",
                "email", request.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
            token,
            "bearer",
            Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole())
        ));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        try {
            emailService.sendOTP(email, otp);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP"));
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }
        
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP expired"));
        }
        
        user.setEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(
            token,
            "bearer",
            Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole())
        ));
    }
    
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }
        
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP expired"));
        }
        
        // Don't clear OTP yet - keep it for password reset
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email not found"));
        }
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        try {
            emailService.sendPasswordResetOTP(email, otp);
            return ResponseEntity.ok(Map.of("message", "Password reset OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP"));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }
        
        if (user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP expired"));
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        System.out.println("=== Google OAuth Debug ===");
        System.out.println("Google Client ID: " + googleClientId + " (length: " + (googleClientId != null ? googleClientId.length() : "null") + ")");
        System.out.println("Request: " + request);
        
        if (googleClientId == null || googleClientId.trim().isEmpty()) {
            System.out.println("Google OAuth not configured");
            return ResponseEntity.status(501).body(Map.of("error", "Google OAuth not configured"));
        }
        
        String token = request.get("token");
        System.out.println("Token received: " + (token != null ? "[YES]" : "[NO]"));
        
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
            
            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                System.out.println("Google user: " + email + " (" + name + ")");
                
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                    user = new User(email, name, null, "GOOGLE_USER");
                    user.setEmailVerified(true);
                    user.setRole("USER");
                    userRepository.save(user);
                    System.out.println("Created new user: " + email);
                } else {
                    System.out.println("Found existing user: " + email);
                }
                
                String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole());
                System.out.println("JWT generated successfully");
                return ResponseEntity.ok(new AuthResponse(
                    jwtToken,
                    "bearer",
                    Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "role", user.getRole())
                ));
            } else {
                System.out.println("Google token verification failed - null token");
            }
        } catch (Exception e) {
            System.out.println("Google OAuth error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Google token: " + e.getMessage()));
        }
        
        return ResponseEntity.status(401).body(Map.of("error", "Google authentication failed"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        // Get current user from JWT token (you'll need to implement this)
        // For now, assuming admin user
        User user = userRepository.findByEmail("pradhafashionoutlet@gmail.com")
            .orElse(userRepository.findByEmail("admin@pradha.com").orElse(null));
        
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
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
