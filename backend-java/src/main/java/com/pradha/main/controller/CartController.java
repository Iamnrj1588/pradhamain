package com.pradha.main.controller;

import com.pradha.main.entity.CartItem;
import com.pradha.main.entity.Product;
import com.pradha.main.entity.User;
import com.pradha.main.repository.CartRepository;
import com.pradha.main.repository.ProductRepository;
import com.pradha.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500"})
public class CartController {

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getCart() {
        List<CartItem> cartItems = cartRepository.findAll();
        List<Map<String, Object>> cartWithDetails = new ArrayList<>();
        
        for (CartItem item : cartItems) {
            Map<String, Object> cartItemWithProduct = new HashMap<>();
            cartItemWithProduct.put("id", item.getId());
            cartItemWithProduct.put("quantity", item.getQuantity());
            cartItemWithProduct.put("size", item.getSize());
            cartItemWithProduct.put("color", item.getColor());
            cartItemWithProduct.put("customizationNotes", item.getCustomizationNotes());
            
            // Get product details
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                System.out.println("=== Cart Product Debug ===");
                System.out.println("Product: " + product.getName());
                System.out.println("Images list: " + product.getImages());
                
                cartItemWithProduct.put("product", Map.of(
                    "id", product.getId(),
                    "name", product.getName(),
                    "price", product.getPrice(),
                    "images", product.getImages() != null ? product.getImages() : new ArrayList<>(),
                    "category", product.getCategory(),
                    "subcategory", product.getSubcategory()
                ));
            }
            
            cartWithDetails.add(cartItemWithProduct);
        }
        
        return ResponseEntity.ok(cartWithDetails);
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== Cart Add Request ===");
            System.out.println("Request data: " + request);
            
            // Validate product exists
            String productId = (String) request.get("product_id");
            if (productId == null || productId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product ID is required"));
            }
            
            if (!productRepository.existsById(productId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
            }
            
            // Get user ID from JWT token
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = "guest";
            
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
            
            // Ensure guest user exists in database
            if ("guest".equals(userId)) {
                if (!userRepository.existsById("guest")) {
                    User guestUser = new User();
                    guestUser.setId("guest");
                    guestUser.setEmail("guest@pradha.com");
                    guestUser.setName("Guest User");
                    guestUser.setPassword("guest");
                    guestUser.setRole("GUEST");
                    userRepository.save(guestUser);
                }
            }
            String size = (String) request.get("size");
            if (size == null || size.trim().isEmpty()) {
                size = "M";
            }
            
            String color = (String) request.get("color");
            if (color == null || color.trim().isEmpty()) {
                color = "Default";
            }
            
            // Check if item already exists in cart
            List<CartItem> existingItems = cartRepository.findAll();
            for (CartItem existing : existingItems) {
                if (existing.getUserId().equals(userId) && 
                    existing.getProductId().equals(productId) &&
                    existing.getSize().equals(size) &&
                    existing.getColor().equals(color)) {
                    
                    // Update quantity instead of creating new item
                    Object quantityObj = request.get("quantity");
                    Integer additionalQuantity = quantityObj != null ? Integer.valueOf(quantityObj.toString()) : 1;
                    existing.setQuantity(existing.getQuantity() + additionalQuantity);
                    cartRepository.save(existing);
                    return ResponseEntity.ok(Map.of("message", "Cart updated"));
                }
            }
            
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
            cartItem.setSize(size);
            cartItem.setColor(color);
            
            Object quantityObj = request.get("quantity");
            Integer quantity = quantityObj != null ? Integer.valueOf(quantityObj.toString()) : 1;
            cartItem.setQuantity(quantity);
            
            cartItem.setCustomizationNotes((String) request.get("customization_notes"));
            
            System.out.println("Saving new cart item: " + cartItem.getProductId());
            cartRepository.save(cartItem);
            System.out.println("✅ Cart item saved successfully");
            
            return ResponseEntity.ok(Map.of("message", "Added to cart"));
        } catch (Exception e) {
            System.err.println("❌ Cart add failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to add to cart: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartItem(@PathVariable String id, @RequestParam int quantity) {
        return cartRepository.findById(id)
                .map(cartItem -> {
                    cartItem.setQuantity(quantity);
                    cartRepository.save(cartItem);
                    return ResponseEntity.ok(Map.of("message", "Cart updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable String id) {
        if (cartRepository.existsById(id)) {
            cartRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Item removed"));
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/debug")
    public ResponseEntity<?> debugCart() {
        List<CartItem> cartItems = cartRepository.findAll();
        if (cartItems.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Cart is empty"));
        }
        
        CartItem firstItem = cartItems.get(0);
        Product product = productRepository.findById(firstItem.getProductId()).orElse(null);
        
        return ResponseEntity.ok(Map.of(
            "cartItem", firstItem,
            "product", product,
            "productImages", product != null ? product.getImages() : null
        ));
    }
}
