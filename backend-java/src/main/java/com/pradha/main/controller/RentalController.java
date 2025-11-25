package com.pradha.main.controller;

import com.pradha.main.dto.RentalBookingRequest;
import com.pradha.main.entity.RentalBooking;
import com.pradha.main.entity.RentalDress;
import com.pradha.main.service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rental")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://18.205.19.24"})
public class RentalController {

    @Autowired
    private RentalService rentalService;

    @GetMapping("/dresses")
    public ResponseEntity<List<RentalDress>> getAllDresses() {
        return ResponseEntity.ok(rentalService.getAllAvailableDresses());
    }

    @GetMapping("/dresses/available")
    public ResponseEntity<List<RentalDress>> getAvailableDresses(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(rentalService.getAvailableDressesForDateRange(startDate, endDate));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @RequestParam String userId,
            @Valid @RequestBody RentalBookingRequest request) {
        try {
            RentalBooking booking = rentalService.createBooking(userId, request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<RentalBooking>> getUserBookings(@PathVariable String userId) {
        return ResponseEntity.ok(rentalService.getUserBookings(userId));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<RentalBooking>> getAllBookings() {
        return ResponseEntity.ok(rentalService.getAllBookings());
    }

    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String bookingId,
            @RequestParam RentalBooking.BookingStatus status,
            @RequestParam(required = false) String adminNotes) {
        try {
            RentalBooking booking = rentalService.updateBookingStatus(bookingId, status, adminNotes);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
