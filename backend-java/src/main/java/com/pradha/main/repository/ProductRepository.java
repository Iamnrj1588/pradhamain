package com.pradha.main.repository;

import com.pradha.main.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(String category);
    List<Product> findByFeatured(Boolean featured);
    List<Product> findByCategoryAndFeatured(String category, Boolean featured);
}