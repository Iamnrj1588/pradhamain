package com.pradha.main.service;

import com.pradha.main.dto.RentalBookingRequest;
import com.pradha.main.entity.RentalBooking;
import com.pradha.main.entity.RentalDress;
import com.pradha.main.entity.User;
import com.pradha.main.repository.RentalBookingRepository;
import com.pradha.main.repository.RentalDressRepository;
import com.pradha.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class RentalService {

    @Autowired
    private RentalDressRepository rentalDressRepository;

    @Autowired
    private RentalBookingRepository rentalBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<RentalDress> getAllAvailableDresses() {
        return rentalDressRepository.findByAvailableTrue();
    }

    public List<RentalDress> getAvailableDressesForDateRange(LocalDate startDate, LocalDate endDate) {
        return rentalDressRepository.findAvailableDressesForDateRange(startDate, endDate);
    }

    public RentalBooking createBooking(String userId, RentalBookingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        RentalDress dress = rentalDressRepository.findById(request.getDressId())
            .orElseThrow(() -> new RuntimeException("Dress not found"));

        // Check for conflicts
        List<RentalBooking> conflicts = rentalBookingRepository.findConflictingBookings(
            request.getDressId(), request.getStartDate(), request.getEndDate());
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Dress is not available for selected dates");
        }

        // Calculate total amount
        long daysBetween = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        long days = Math.max(1, daysBetween);
        BigDecimal totalAmount = dress.getPricePerDay().multiply(BigDecimal.valueOf(days));

        RentalBooking booking = new RentalBooking();
        booking.setUser(user);
        booking.setDress(dress);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setSelectedSize(request.getSelectedSize());
        booking.setChestMeasurement(request.getChestMeasurement());
        booking.setWaistMeasurement(request.getWaistMeasurement());
        booking.setHipMeasurement(request.getHipMeasurement());
        booking.setTotalAmount(totalAmount);
        booking.setCustomerNotes(request.getCustomerNotes());
        booking.setRequiresDelivery(request.getRequiresDelivery());
        booking.setDeliveryAddress(request.getDeliveryAddress());

        RentalBooking savedBooking = rentalBookingRepository.save(booking);

        // Send notifications
        notificationService.sendBookingConfirmation(savedBooking);

        return savedBooking;
    }

    public List<RentalBooking> getUserBookings(String userId) {
        return rentalBookingRepository.findByUserId(userId);
    }

    public List<RentalBooking> getAllBookings() {
        return rentalBookingRepository.findAll();
    }

    public RentalBooking updateBookingStatus(String bookingId, RentalBooking.BookingStatus status, String adminNotes) {
        RentalBooking booking = rentalBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        booking.setAdminNotes(adminNotes);
        
        RentalBooking updatedBooking = rentalBookingRepository.save(booking);
        
        // Send status update notification
        notificationService.sendBookingStatusUpdate(updatedBooking);
        
        return updatedBooking;
    }
}