package com.pradha.main.service;

import com.pradha.main.dto.CouponValidationRequest;
import com.pradha.main.dto.CouponValidationResponse;
import com.pradha.main.entity.Coupon;
import com.pradha.main.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {
    
    @Autowired
    private CouponRepository couponRepository;
    
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }
    
    public Coupon createCoupon(Coupon coupon) {
        // Validate required fields
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new RuntimeException("Coupon code is required");
        }
        if (coupon.getDiscountValue() == null) {
            throw new RuntimeException("Discount value is required");
        }
        if (coupon.getDiscountType() == null || coupon.getDiscountType().trim().isEmpty()) {
            throw new RuntimeException("Discount type is required");
        }
        
        // Set defaults
        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }
        if (coupon.getIsActive() == null) {
            coupon.setIsActive(true);
        }
        
        // Normalize code to uppercase
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        
        return couponRepository.save(coupon);
    }
    
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coupon not found"));
        
        // Check if code is being changed and if new code already exists
        if (!coupon.getCode().equals(couponDetails.getCode()) && 
            couponRepository.existsByCode(couponDetails.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        
        coupon.setCode(couponDetails.getCode());
        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setMinOrderAmount(couponDetails.getMinOrderAmount());
        coupon.setMaxDiscount(couponDetails.getMaxDiscount());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setValidFrom(couponDetails.getValidFrom());
        coupon.setValidUntil(couponDetails.getValidUntil());
        coupon.setIsActive(couponDetails.getIsActive());
        
        return couponRepository.save(coupon);
    }
    
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found");
        }
        couponRepository.deleteById(id);
    }
    
    public CouponValidationResponse validateCoupon(CouponValidationRequest request) {
        try {
            String code = request.getCode().toUpperCase();
            BigDecimal orderAmount = request.getOrderAmount();
            
            System.out.println("Service: Validating coupon " + code + " for amount " + orderAmount);
            
            // Find coupon
            Optional<Coupon> couponOpt = couponRepository.findValidCouponByCode(code, LocalDateTime.now());
            if (!couponOpt.isPresent()) {
                System.out.println("Service: Coupon not found or expired: " + code);
                return new CouponValidationResponse(false, "Invalid or expired coupon code");
            }
            
            Coupon coupon = couponOpt.get();
            System.out.println("Service: Found coupon - UsedCount: " + coupon.getUsedCount() + ", UsageLimit: " + coupon.getUsageLimit());
            
            // Check usage limit
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                return new CouponValidationResponse(false, "Coupon usage limit exceeded");
            }
            
            // Check minimum order amount
            if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
                return new CouponValidationResponse(false, 
                    "Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");
            }
            
            // Check applicability
            String applicableTo = coupon.getApplicableTo();
            String orderType = request.getOrderType();
            
            if ("PURCHASE_ONLY".equals(applicableTo) && "RENTAL".equals(orderType)) {
                return new CouponValidationResponse(false, "This coupon is only valid for purchase items");
            }
            if ("RENTAL_ONLY".equals(applicableTo) && "PURCHASE".equals(orderType)) {
                return new CouponValidationResponse(false, "This coupon is only valid for rental items");
            }
            if ("SPECIFIC_CATEGORY".equals(applicableTo)) {
                String productCategory = request.getProductCategory();
                if (productCategory == null || !productCategory.equals(coupon.getSpecificCategory())) {
                    return new CouponValidationResponse(false, "This coupon is only valid for " + coupon.getSpecificCategory() + " category");
                }
            }
            if ("SPECIFIC_PRODUCT".equals(applicableTo)) {
                String productId = request.getProductId();
                if (productId == null || !productId.equals(coupon.getSpecificProductId())) {
                    return new CouponValidationResponse(false, "This coupon is only valid for a specific product");
                }
            }
            
            // Calculate discount
            BigDecimal discountAmount = calculateDiscount(coupon, orderAmount);
            System.out.println("Service: Calculated discount: " + discountAmount);
            
            return new CouponValidationResponse(coupon, discountAmount);
        } catch (Exception e) {
            System.err.println("Service: Exception in validateCoupon: " + e.getMessage());
            e.printStackTrace();
            return new CouponValidationResponse(false, "Validation failed: " + e.getMessage());
        }
    }
    
    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        
        if ("PERCENTAGE".equals(coupon.getDiscountType())) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"));
            
            // Apply max discount limit for percentage coupons
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            // Fixed amount discount
            discount = coupon.getDiscountValue();
        }
        
        // Ensure discount doesn't exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }
        
        return discount;
    }
    
    @Transactional
    public void incrementUsage(String code) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(code);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }
    
    public List<Coupon> getActiveOffers() {
        return couponRepository.findValidCouponsForOffers(LocalDateTime.now());
    }
}