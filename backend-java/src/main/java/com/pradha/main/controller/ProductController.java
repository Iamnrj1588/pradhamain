package com.pradha.main.controller;

import com.pradha.main.entity.Product;
import com.pradha.main.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        return productRepository.findById(id)
                .map(existing -> {
                    product.setId(id);
                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(p -> {
                    productRepository.delete(p);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

