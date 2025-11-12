package com.pradha.main.controller;

import com.pradha.main.dto.InquiryRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24"})
public class InquiryController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            String sql = "SELECT column_name FROM information_schema.columns WHERE table_name = 'inquiries'";
            var columns = jdbcTemplate.queryForList(sql, String.class);
            return ResponseEntity.ok("Table columns: " + columns);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("DB Error: " + e.getMessage());
        }
    }

    @PostMapping("/inquiries")
    public ResponseEntity<?> createInquiry(@RequestBody InquiryRequest request) {
        try {
            System.out.println("Received inquiry: " + request.getName() + ", " + request.getEmail());
            
            if (request.getName() == null || request.getEmail() == null || request.getMessage() == null) {
                return ResponseEntity.badRequest().body("Name, email, and message are required");
            }
            
            // Generate UUID for ID
            String inquiryId = java.util.UUID.randomUUID().toString();
            
            String sql = "INSERT INTO inquiries (id, name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            int result = jdbcTemplate.update(sql, inquiryId, request.getName(), request.getEmail(), request.getPhone(), request.getMessage());
            
            System.out.println("Insert result: " + result);
            return ResponseEntity.ok("Inquiry submitted successfully");
        } catch (Exception e) {
            System.err.println("Error saving inquiry: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save inquiry: " + e.getMessage());
        }
    }

    @GetMapping("/admin/inquiries")
    public ResponseEntity<?> getAdminInquiries() {
        try {
            String sql = "SELECT id, name, email, phone, message, created_at FROM inquiries ORDER BY created_at DESC";
            var inquiries = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch inquiries: " + e.getMessage());
        }
    }
}