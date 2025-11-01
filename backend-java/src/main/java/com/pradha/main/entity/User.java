package com.pradha.main.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id = UUID.randomUUID().toString();

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    private String name;

    private String phone;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password; // main field

    @Transient
    private String otp; // For OTP verification

    private String role = "USER";

    private boolean emailVerified = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String email, String name, String phone, String password) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.password = password;
    }

    // ---- GETTERS & SETTERS ----
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // ✅ backward compatibility for old code
    public String getPasswordHash() { return password; }
    public void setPasswordHash(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // ✅ OTP fields support
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

