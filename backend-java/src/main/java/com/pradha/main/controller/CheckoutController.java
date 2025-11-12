package com.pradha.main.controller;

import com.pradha.main.dto.CheckoutRequest;
import com.pradha.main.entity.*;
import com.pradha.main.repository.*;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = {"http://localhost:3000", "http://18.205.19.24"})
public class CheckoutController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private RentalDressRepository rentalDressRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CheckoutRequest request) {
        try {
            System.out.println("=== Checkout Request Debug ===");
            System.out.println("Request object: " + (request != null ? "not null" : "NULL"));
            
            if (request == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is null"));
            }
            
            System.out.println("Order Type: " + request.getOrderType());
            System.out.println("Items: " + request.getItems());
            System.out.println("Items count: " + (request.getItems() != null ? request.getItems().size() : 0));
            System.out.println("Shipping Address: " + request.getShippingAddress());
            System.out.println("Phone: " + request.getPhone());
            System.out.println("Email: " + request.getEmail());
            
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No items in cart"));
            }
            // Get user ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = "guest";
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) userId = user.getId();
            }

            // Calculate total amount
            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();
            
            for (CheckoutRequest.CheckoutItem item : request.getItems()) {
                BigDecimal itemPrice = BigDecimal.ZERO;
                
                if (item.getProductId() != null) {
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    if (product != null) {
                        itemPrice = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(item.getQuantity()));
                    }
                } else if (item.getRentalDressId() != null) {
                    RentalDress dress = rentalDressRepository.findById(item.getRentalDressId()).orElse(null);
                    if (dress != null) {
                        long days = ChronoUnit.DAYS.between(request.getRentalStartDate(), request.getRentalEndDate()) + 1;
                        itemPrice = dress.getPricePerDay().multiply(BigDecimal.valueOf(days));
                    }
                }
                
                totalAmount = totalAmount.add(itemPrice);
                
                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(item.getProductId());
                orderItem.setRentalDressId(item.getRentalDressId());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setSize(item.getSize());
                orderItem.setColor(item.getColor());
                orderItem.setPrice(itemPrice);
                orderItem.setCustomizationNotes(item.getCustomizationNotes());
                orderItems.add(orderItem);
            }

            // Mock Razorpay order for testing
            String mockOrderId = "order_" + System.currentTimeMillis();
            
            // Skip Razorpay if credentials are not set
            if ("rzp_test_your_key_id".equals(razorpayKeyId) || "your_secret_key".equals(razorpayKeySecret)) {
                System.out.println("Using mock payment - Razorpay credentials not configured");
            } else {
                // Create real Razorpay order
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).intValue());
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", mockOrderId);
                
                com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
                mockOrderId = razorpayOrder.get("id");
            }

            // Create order in database
            Order order = new Order();
            order.setUserId(userId);
            order.setOrderType(Order.OrderType.valueOf(request.getOrderType()));
            order.setTotalAmount(totalAmount);
            order.setRazorpayOrderId(mockOrderId);
            order.setShippingAddress(request.getShippingAddress());
            order.setPhone(request.getPhone());
            order.setEmail(request.getEmail());
            order.setRentalStartDate(request.getRentalStartDate());
            order.setRentalEndDate(request.getRentalEndDate());
            
            if (request.getRentalStartDate() != null && request.getRentalEndDate() != null) {
                order.setRentalDays((int) ChronoUnit.DAYS.between(request.getRentalStartDate(), request.getRentalEndDate()) + 1);
            }

            order = orderRepository.save(order);

            // Save order items
            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }
            order.setOrderItems(orderItems);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                "orderId", mockOrderId,
                "amount", totalAmount.multiply(BigDecimal.valueOf(100)).intValue(),
                "currency", "INR",
                "keyId", razorpayKeyId,
                "mockPayment", "rzp_test_your_key_id".equals(razorpayKeyId)
            ));

        } catch (RazorpayException e) {
            System.err.println("❌ Razorpay error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Payment gateway error: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Checkout error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> request) {
        try {
            String razorpayOrderId = request.get("razorpay_order_id");
            String razorpayPaymentId = request.get("razorpay_payment_id");

            Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of("message", "Payment verified successfully", "orderId", order.getId()));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Payment verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Checkout controller is working", "timestamp", System.currentTimeMillis()));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getUserOrders() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = "guest";
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) userId = user.getId();
            }

            List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }
}