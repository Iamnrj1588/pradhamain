package com.pradha.main.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id", "size", "color"})
})
public class CartItem {
    @Id
    private String id = UUID.randomUUID().toString();

    @NotBlank
    @Column(name = "user_id")
    private String userId;

    @NotBlank
    @Column(name = "product_id")
    private String productId;

    @NotNull
    private Integer quantity = 1;

    @NotBlank
    private String size;

    @NotBlank
    private String color;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Optional field (you were using it in getters/setters)
    private String customizationNotes;

    // Constructors
    public CartItem() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCustomizationNotes() { return customizationNotes; }
    public void setCustomizationNotes(String customizationNotes) { this.customizationNotes = customizationNotes; }
}

