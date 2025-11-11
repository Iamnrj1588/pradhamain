package com.pradha.main.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rental_dresses")
public class RentalDress {

    @Id
    private String id = UUID.randomUUID().toString();

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private BigDecimal pricePerDay;

    @ElementCollection
    @CollectionTable(name = "rental_dress_images")
    private List<String> imageUrls;

    @ElementCollection
    @CollectionTable(name = "rental_dress_sizes")
    private List<String> availableSizes;

    private String category; // Main category like "Festival", "Wedding", "Party"
    private String subcategory; // Specific like "Navratri", "Sangam", "Reception"
    private String occasion; // Event type
    private String color;
    private boolean available = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public RentalDress() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<String> getAvailableSizes() { return availableSizes; }
    public void setAvailableSizes(List<String> availableSizes) { this.availableSizes = availableSizes; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getOccasion() { return occasion; }
    public void setOccasion(String occasion) { this.occasion = occasion; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}