package com.pradha.main.controller;

import com.pradha.main.entity.User;
import com.pradha.main.repository.UserRepository;
import com.pradha.main.security.JwtUtil;
import com.pradha.main.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // ✅ Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email already exists!"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        User newUser = userRepository.save(user);

        // ✅ Generate OTP
        String otp = UUID.randomUUID().toString().substring(0, 6);

        // store OTP temporarily (you will later store in DB or Redis)
        newUser.setOtp(otp);
        userRepository.save(newUser);

        // ✅ Send OTP Email
        emailService.sendOTP(newUser.getEmail(), otp);

        return ResponseEntity.ok(Collections.singletonMap("message", "User registered. OTP sent to email"));
    }

    // ✅ Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Invalid email or password"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Collections.singletonMap("message", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "role", user.getRole(),
                "message", "Login successful"
        ));
    }

    // ✅ Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String otp = req.get("otp");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Collections.singletonMap("message", "Invalid email"));
        }

        User user = userOpt.get();

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return ResponseEntity.status(400).body(Collections.singletonMap("message", "Invalid OTP"));
        }

        user.setOtp(null); // OTP used
        userRepository.save(user);

        return ResponseEntity.ok(Collections.singletonMap("message", "Email verified successfully"));
    }
}

