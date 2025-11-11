package com.pradha.main.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rental_bookings")
public class RentalBooking {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "dress_id", nullable = false)
    private RentalDress dress;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String selectedSize;
    
    private String chestMeasurement;
    private String waistMeasurement;
    private String hipMeasurement;
    private String customizationNotes;

    @NotNull
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.PENDING;

    private String customerNotes;
    private String adminNotes;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }

    // Constructors
    public RentalBooking() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public RentalDress getDress() { return dress; }
    public void setDress(RentalDress dress) { this.dress = dress; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getSelectedSize() { return selectedSize; }
    public void setSelectedSize(String selectedSize) { this.selectedSize = selectedSize; }
    
    public String getChestMeasurement() { return chestMeasurement; }
    public void setChestMeasurement(String chestMeasurement) { this.chestMeasurement = chestMeasurement; }
    
    public String getWaistMeasurement() { return waistMeasurement; }
    public void setWaistMeasurement(String waistMeasurement) { this.waistMeasurement = waistMeasurement; }
    
    public String getHipMeasurement() { return hipMeasurement; }
    public void setHipMeasurement(String hipMeasurement) { this.hipMeasurement = hipMeasurement; }
    
    public String getCustomizationNotes() { return customizationNotes; }
    public void setCustomizationNotes(String customizationNotes) { this.customizationNotes = customizationNotes; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}