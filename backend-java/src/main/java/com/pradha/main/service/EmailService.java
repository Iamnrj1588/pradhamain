package com.pradha.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOTP(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(toEmail);
            helper.setSubject("Pradha Fashion Outlet - Email Verification");
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Email Verification - Pradha Fashion Outlet</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333;'>" +
                "<table role='presentation' style='width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;'>" +
                "<tr><td style='text-align: center; padding: 20px 0;'>" +
                "<img src='https://www.pradhafashionoutlet.com/logo.png' alt='Pradha Fashion Outlet' style='max-width: 150px; height: auto;' />" +
                "</td></tr>" +
                "<tr><td style='text-align: center; padding: 20px 0;'>" +
                "<h1 style='color: #8B1538; font-size: 24px; margin: 0 0 10px 0;'>Email Verification</h1>" +
                "<p style='color: #666666; font-size: 16px; margin: 0 0 30px 0;'>Your OTP for email verification is:</p>" +
                "<div style='font-size: 32px; font-weight: bold; color: #8B1538; margin: 20px 0; letter-spacing: 4px;'>" +
                otpCode +
                "</div>" +
                "<p style='color: #666666; font-size: 14px; margin: 20px 0 0 0;'>This OTP will expire in 10 minutes.</p>" +
                "<p style='color: #8B1538; font-size: 16px; margin: 20px 0 0 0;'>Thank you for joining Pradha Fashion Outlet!</p>" +
                "</td></tr>" +
                "<tr><td style='text-align: center; padding: 30px 0 10px 0; border-top: 1px solid #eeeeee;'>" +
                "<p style='color: #999999; font-size: 14px; margin: 0;'>&copy; 2024 Pradha Fashion Outlet. All rights reserved.</p>" +
                "</td></tr>" +
                "</table></body></html>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendPasswordResetOTP(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(toEmail);
            helper.setSubject("Pradha Fashion Outlet - Password Reset");
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Password Reset - Pradha Fashion Outlet</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333;'>" +
                "<table role='presentation' style='width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;'>" +
                "<tr><td style='text-align: center; padding: 20px 0;'>" +
                "<img src='https://www.pradhafashionoutlet.com/logo.png' alt='Pradha Fashion Outlet' style='max-width: 150px; height: auto;' />" +
                "</td></tr>" +
                "<tr><td style='text-align: center; padding: 20px 0;'>" +
                "<h1 style='color: #8B1538; font-size: 24px; margin: 0 0 10px 0;'>Password Reset</h1>" +
                "<p style='color: #666666; font-size: 16px; margin: 0 0 30px 0;'>Your password reset code is:</p>" +
                "<div style='font-size: 32px; font-weight: bold; color: #8B1538; margin: 20px 0; letter-spacing: 4px;'>" +
                otpCode +
                "</div>" +
                "<p style='color: #666666; font-size: 14px; margin: 20px 0 0 0;'>This code will expire in 10 minutes.</p>" +
                "<p style='color: #e74c3c; font-size: 14px; margin: 10px 0 0 0;'>If you didn't request this, please ignore this email.</p>" +
                "</td></tr>" +
                "<tr><td style='text-align: center; padding: 30px 0 10px 0; border-top: 1px solid #eeeeee;'>" +
                "<p style='color: #999999; font-size: 14px; margin: 0;'>&copy; 2024 Pradha Fashion Outlet. All rights reserved.</p>" +
                "</td></tr>" +
                "</table></body></html>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("✅ Password reset OTP sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset OTP: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset OTP", e);
        }
    }

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

