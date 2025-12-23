package com.pradha.main.controller;

import com.pradha.main.dto.CouponValidationRequest;
import com.pradha.main.dto.CouponValidationResponse;
import com.pradha.main.entity.Coupon;
import com.pradha.main.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24"}, allowCredentials = "false")
public class CouponController {
    
    @Autowired
    private CouponService couponService;
    
    // Admin endpoints
    // Test endpoint to check if controller is working
    @GetMapping("/admin/coupons/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Coupon controller is working");
    }
    
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        try {
            List<Coupon> coupons = couponService.getAllCoupons();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            System.out.println("Creating coupon: " + coupon.getCode());
            Coupon createdCoupon = couponService.createCoupon(coupon);
            return ResponseEntity.ok(createdCoupon);
        } catch (RuntimeException e) {
            System.err.println("Coupon creation error: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            System.err.println("Unexpected error creating coupon: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Failed to create coupon: " + e.getMessage() + "\"}");
        }
    }
    
    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        try {
            Coupon updatedCoupon = couponService.updateCoupon(id, coupon);
            return ResponseEntity.ok(updatedCoupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to update coupon\"}");
        }
    }
    
    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to delete coupon\"}");
        }
    }
    
    // Customer endpoint for coupon validation
    @PostMapping("/coupons/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody CouponValidationRequest request) {
        try {
            System.out.println("Validating coupon: " + request.getCode() + " for amount: " + request.getOrderAmount());
            
            if (request.getCode() == null || request.getCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Coupon code is required\"}");
            }
            if (request.getOrderAmount() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Order amount is required\"}");
            }
            
            CouponValidationResponse response = couponService.validateCoupon(request);
            if (response.isValid()) {
                System.out.println("Coupon validation successful: " + response.getDiscountAmount());
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Coupon validation failed: " + response.getError());
                return ResponseEntity.badRequest().body("{\"error\": \"" + response.getError() + "\"}");
            }
        } catch (Exception e) {
            System.err.println("Coupon validation exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Failed to validate coupon: " + e.getMessage() + "\"}");
        }
    }
    
    // Endpoint to increment coupon usage (called after successful booking)
    @PostMapping("/coupons/{code}/increment")
    public ResponseEntity<?> incrementCouponUsage(@PathVariable String code) {
        try {
            couponService.incrementUsage(code);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to increment coupon usage\"}");
        }
    }
    
    // Public endpoint to get active offers
    @GetMapping("/coupons/offers")
    public ResponseEntity<?> getActiveOffers() {
        try {
            List<Coupon> activeCoupons = couponService.getActiveOffers();
            return ResponseEntity.ok(activeCoupons);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Failed to fetch offers\"}");
        }
    }
}