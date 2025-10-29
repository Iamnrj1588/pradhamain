package com.pradha.main.service;

import com.pradha.main.entity.EmailOTP;
import com.pradha.main.repository.EmailOTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OTPService {

    @Autowired
    private EmailOTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public String generateAndSendOTP(String email) {
        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        // Set expiry time (10 minutes from now)
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);
        
        // Delete any existing OTPs for this email
        otpRepository.deleteByEmail(email);
        
        // Save new OTP
        EmailOTP emailOTP = new EmailOTP(email, otpCode, expiryTime);
        otpRepository.save(emailOTP);
        
        // Send email
        emailService.sendOTP(email, otpCode);
        
        return otpCode;
    }

    @Transactional
    public boolean verifyOTP(String email, String otpCode) {
        var otpOptional = otpRepository.findByEmailAndOtpCodeAndVerifiedFalse(email, otpCode);
        
        if (otpOptional.isEmpty()) {
            return false;
        }
        
        EmailOTP emailOTP = otpOptional.get();
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(emailOTP.getExpiryTime())) {
            return false;
        }
        
        // Mark as verified
        emailOTP.setVerified(true);
        otpRepository.save(emailOTP);
        
        return true;
    }
}