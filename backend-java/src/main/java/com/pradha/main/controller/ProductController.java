package com.pradha.main.controller;

import com.pradha.main.entity.Product;
import com.pradha.main.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
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

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable String id) {
        return productRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }
}