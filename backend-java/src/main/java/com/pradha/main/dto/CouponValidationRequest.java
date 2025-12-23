package com.pradha.main.dto;

import java.math.BigDecimal;

public class CouponValidationRequest {
    private String code;
    private BigDecimal orderAmount;
    private String orderType; // "PURCHASE" or "RENTAL"
    private String productCategory; // Category/subcategory of the product
    private String productId; // Specific product ID
    
    public CouponValidationRequest() {}
    
    public CouponValidationRequest(String code, BigDecimal orderAmount) {
        this.code = code;
        this.orderAmount = orderAmount;
    }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public BigDecimal getOrderAmount() { return orderAmount; }
    public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }
    
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
}