package com.pradha.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOTP(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
           message.setSubject("Pradha Fashion Outlet - Email Verification");
           message.setText("Your OTP for email verification is: " + otpCode + "\n\nThis OTP will expire in 10 minutes.\n\nThank you for joining Pradha Fashion Outlet!");

            mailSender.send(message);
            System.out.println("✅ OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    // ✅ ADD THIS
    public void sendVerificationEmail(String email) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Account Verified - Pradha Fashion");
            message.setText("Your Pradha account is successfully created. You can now log in.");

            mailSender.send(message);
            System.out.println("✅ Verification Email sent to: " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
}

