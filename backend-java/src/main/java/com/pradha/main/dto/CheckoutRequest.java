package com.pradha.main.dto;

import java.time.LocalDate;
import java.util.List;

public class CheckoutRequest {
    private String orderType; // PURCHASE or RENTAL
    private String shippingAddress;
    private String phone;
    private String email;
    private String couponCode;
    private LocalDate rentalStartDate;
    private LocalDate rentalEndDate;
    private List<CheckoutItem> items;
    
    public static class CheckoutItem {
        private String productId;
        private String rentalDressId;
        private Integer quantity;
        private String size;
        private String color;
        private String customizationNotes;
        
        // Getters and Setters
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getRentalDressId() { return rentalDressId; }
        public void setRentalDressId(String rentalDressId) { this.rentalDressId = rentalDressId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public String getCustomizationNotes() { return customizationNotes; }
        public void setCustomizationNotes(String customizationNotes) { this.customizationNotes = customizationNotes; }
    }
    
    // Getters and Setters
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    
    public LocalDate getRentalStartDate() { return rentalStartDate; }
    public void setRentalStartDate(LocalDate rentalStartDate) { this.rentalStartDate = rentalStartDate; }
    
    public LocalDate getRentalEndDate() { return rentalEndDate; }
    public void setRentalEndDate(LocalDate rentalEndDate) { this.rentalEndDate = rentalEndDate; }
    
    public List<CheckoutItem> getItems() { return items; }
    public void setItems(List<CheckoutItem> items) { this.items = items; }
}