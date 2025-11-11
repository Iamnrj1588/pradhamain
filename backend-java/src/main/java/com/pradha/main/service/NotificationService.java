package com.pradha.main.service;

import com.pradha.main.entity.RentalBooking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${whatsapp.api-url}")
    private String whatsappApiUrl;
    
    @Value("${whatsapp.access-token}")
    private String whatsappAccessToken;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public void sendBookingConfirmation(RentalBooking booking) {
        // Send email to customer
        sendEmailToCustomer(booking);
        
        // Send email to admin
        sendEmailToAdmin(booking);
        
        // Send WhatsApp notification (placeholder)
        sendWhatsAppNotification(booking);
    }

    public void sendBookingStatusUpdate(RentalBooking booking) {
        sendEmailToCustomer(booking);
    }

    private void sendEmailToCustomer(RentalBooking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getUser().getEmail());
            message.setSubject("Dress Rental Booking - " + booking.getStatus());
            message.setText(buildCustomerEmailContent(booking));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to customer: " + e.getMessage());
        }
    }

    private void sendEmailToAdmin(RentalBooking booking) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("pradhafashionoutlet@gmail.com"); // Admin email
            message.setSubject("New Dress Rental Booking - " + booking.getId());
            message.setText(buildAdminEmailContent(booking));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to admin: " + e.getMessage());
        }
    }

    private void sendWhatsAppNotification(RentalBooking booking) {
        // WhatsApp notification disabled - will be implemented later
        System.out.println("WhatsApp notification disabled for booking: " + booking.getId());
    }

    private String buildCustomerEmailContent(RentalBooking booking) {
        StringBuilder measurements = new StringBuilder();
        if (booking.getChestMeasurement() != null && !booking.getChestMeasurement().isEmpty()) {
            measurements.append("Chest: ").append(booking.getChestMeasurement()).append(" inches\n");
        }
        if (booking.getWaistMeasurement() != null && !booking.getWaistMeasurement().isEmpty()) {
            measurements.append("Waist: ").append(booking.getWaistMeasurement()).append(" inches\n");
        }
        if (booking.getHipMeasurement() != null && !booking.getHipMeasurement().isEmpty()) {
            measurements.append("Hip: ").append(booking.getHipMeasurement()).append(" inches\n");
        }
        
        return String.format(
            "Dear %s,\n\n" +
            "Your dress rental booking has been %s.\n\n" +
            "Booking Details:\n" +
            "Dress: %s\n" +
            "Dates: %s to %s\n" +
            "Size: %s\n" +
            "%s" +
            "Total Amount: ₹%s\n\n" +
            "Thank you for choosing Pradha Fashion!\n\n" +
            "Best regards,\n" +
            "Pradha Fashion Team",
            booking.getUser().getName(),
            booking.getStatus().toString().toLowerCase(),
            booking.getDress().getName(),
            booking.getStartDate(),
            booking.getEndDate(),
            booking.getSelectedSize(),
            measurements.length() > 0 ? "Measurements:\n" + measurements.toString() : "",
            booking.getTotalAmount()
        );
    }

    private String buildAdminEmailContent(RentalBooking booking) {
        StringBuilder measurements = new StringBuilder();
        if (booking.getChestMeasurement() != null && !booking.getChestMeasurement().isEmpty()) {
            measurements.append("Chest: ").append(booking.getChestMeasurement()).append(" inches\n");
        }
        if (booking.getWaistMeasurement() != null && !booking.getWaistMeasurement().isEmpty()) {
            measurements.append("Waist: ").append(booking.getWaistMeasurement()).append(" inches\n");
        }
        if (booking.getHipMeasurement() != null && !booking.getHipMeasurement().isEmpty()) {
            measurements.append("Hip: ").append(booking.getHipMeasurement()).append(" inches\n");
        }
        
        return String.format(
            "New Dress Rental Booking Received\n\n" +
            "Customer: %s\n" +
            "Email: %s\n" +
            "Phone: %s\n" +
            "Dress: %s\n" +
            "Dates: %s to %s\n" +
            "Size: %s\n" +
            "%s" +
            "Total Amount: ₹%s\n" +
            "Customer Notes: %s\n\n" +
            "Please review and confirm the booking.",
            booking.getUser().getName(),
            booking.getUser().getEmail(),
            booking.getUser().getPhone(),
            booking.getDress().getName(),
            booking.getStartDate(),
            booking.getEndDate(),
            booking.getSelectedSize(),
            measurements.length() > 0 ? "Measurements:\n" + measurements.toString() : "",
            booking.getTotalAmount(),
            booking.getCustomerNotes()
        );
    }
}