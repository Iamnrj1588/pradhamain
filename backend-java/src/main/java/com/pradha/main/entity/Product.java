package com.pradha.main.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id = UUID.randomUUID().toString();
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String category;
    
    @NotBlank
    private String subcategory;
    
    @NotBlank
    private String description;
    
    @NotNull
    private Double price;
    
    @ElementCollection
    private List<String> sizes;
    
    @ElementCollection
    private List<String> colors;
    
    @ElementCollection
    private List<String> images;
    
    private Boolean customizable = true;
    private Boolean featured = false;
    private Boolean newArrival = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Product() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<String> getSizes() { return sizes; }
    public void setSizes(List<String> sizes) { this.sizes = sizes; }

    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public Boolean getCustomizable() { return customizable; }
    public void setCustomizable(Boolean customizable) { this.customizable = customizable; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getNewArrival() { return newArrival; }
    public void setNewArrival(Boolean newArrival) { this.newArrival = newArrival; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}