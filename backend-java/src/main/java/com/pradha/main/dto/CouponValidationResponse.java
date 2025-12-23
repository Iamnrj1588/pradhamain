package com.pradha.main.dto;

import com.pradha.main.entity.Coupon;
import java.math.BigDecimal;

public class CouponValidationResponse {
    private boolean valid;
    private String error;
    private Coupon coupon;
    private BigDecimal discountAmount;
    
    public CouponValidationResponse() {}
    
    public CouponValidationResponse(boolean valid, String error) {
        this.valid = valid;
        this.error = error;
    }
    
    public CouponValidationResponse(Coupon coupon, BigDecimal discountAmount) {
        this.valid = true;
        this.coupon = coupon;
        this.discountAmount = discountAmount;
    }
    
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    
    public Coupon getCoupon() { return coupon; }
    public void setCoupon(Coupon coupon) { this.coupon = coupon; }
    
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
}