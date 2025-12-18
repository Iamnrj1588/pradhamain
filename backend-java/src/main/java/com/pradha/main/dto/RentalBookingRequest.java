package com.pradha.main.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RentalBookingRequest {
    
    @NotBlank
    private String dressId;
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
    
    @NotBlank
    private String selectedSize;
    
    private String chestMeasurement;
    private String waistMeasurement;
    private String hipMeasurement;
    
    private String customerNotes;
    private Boolean requiresDelivery;
    private String deliveryAddress;

    // Constructors
    public RentalBookingRequest() {}

    // Getters and Setters
    public String getDressId() { return dressId; }
    public void setDressId(String dressId) { this.dressId = dressId; }

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

    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }

    public Boolean getRequiresDelivery() { return requiresDelivery; }
    public void setRequiresDelivery(Boolean requiresDelivery) { this.requiresDelivery = requiresDelivery; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}