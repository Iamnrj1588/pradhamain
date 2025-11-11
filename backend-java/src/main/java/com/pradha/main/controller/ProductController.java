package com.pradha.main.controller;

import com.pradha.main.entity.Product;
import com.pradha.main.repository.ProductRepository;
import com.pradha.main.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://18.205.19.24"
}, allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private S3Service s3Service;

    // ✅ PUBLIC ROUTES
    @GetMapping("/api/products")
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured
    ) {
        if (category != null && featured != null) {
            return productRepository.findByCategoryAndFeatured(category, featured);
        } else if (category != null) {
            return productRepository.findByCategory(category);
        } else if (featured != null) {
            return productRepository.findByFeatured(featured);
        }
        return productRepository.findAll();
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ ADMIN ROUTES
    @PostMapping("/api/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            System.out.println("Creating product: " + product.getName());
            System.out.println("Product data: " + product.toString());
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            System.err.println("Error creating product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            System.out.println("Updating product ID: " + id);
            System.out.println("Product data: " + product.getName());
            
            return productRepository.findById(id)
                    .map(existing -> {
                        product.setId(id);
                        Product savedProduct = productRepository.save(product);
                        return ResponseEntity.ok(savedProduct);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(p -> {
                    productRepository.delete(p);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/api/admin/auth-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testAuth() {
        return ResponseEntity.ok(Map.of("message", "Admin authenticated successfully"));
    }
    
    @PostMapping("/api/admin/products/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadProductImages(
            @PathVariable String productId,
            @RequestParam("images") MultipartFile[] images) {
        try {
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
            
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                String imageUrl = s3Service.uploadFile(image, "products", productId);
                imageUrls.add(imageUrl);
            }
            
            if (product.getImageUrls() == null) {
                product.setImageUrls(new ArrayList<>());
            }
            product.getImageUrls().addAll(imageUrls);
            
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls, "product", savedProduct));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}

