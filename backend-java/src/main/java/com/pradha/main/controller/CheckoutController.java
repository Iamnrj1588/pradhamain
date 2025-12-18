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
            
            // Create Razorpay order (LIVE MODE)
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", mockOrderId);
            
            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            mockOrderId = razorpayOrder.get("id");

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
                "mockPayment", false
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
            // Validate required fields
            String razorpayOrderId = request.get("razorpay_order_id");
            String razorpayPaymentId = request.get("razorpay_payment_id");
            String razorpaySignature = request.get("razorpay_signature");

            if (razorpayOrderId == null || razorpayOrderId.trim().isEmpty() ||
                razorpayPaymentId == null || razorpayPaymentId.trim().isEmpty() ||
                razorpaySignature == null || razorpaySignature.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required payment verification fields"));
            }

            // Find order first to ensure it exists
            Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            // Verify Razorpay signature - CRITICAL SECURITY CHECK
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            String expectedSignature = calculateHMAC(payload, razorpayKeySecret);
            
            System.out.println("=== Payment Verification Debug ===");
            System.out.println("Payload: " + payload);
            System.out.println("Expected Signature: " + expectedSignature);
            System.out.println("Received Signature: " + razorpaySignature);
            
            if (!expectedSignature.equals(razorpaySignature)) {
                System.err.println("❌ SIGNATURE VERIFICATION FAILED - Payment rejected");
                return ResponseEntity.badRequest().body(Map.of("error", "Payment signature verification failed"));
            }

            System.out.println("✅ Signature verified successfully");

            // Only mark as paid AFTER signature verification passes
            order.setRazorpayPaymentId(razorpayPaymentId);
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of("message", "Payment verified successfully", "orderId", order.getId()));

        } catch (Exception e) {
            System.err.println("❌ Payment verification error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Payment verification failed: " + e.getMessage()));
        }
    }

    private String calculateHMAC(String data, String key) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes("UTF-8"));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC", e);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Checkout controller is working", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            // Verify webhook signature
            String expectedSignature = calculateHMAC(payload, razorpayKeySecret);
            if (!expectedSignature.equals(signature)) {
                return ResponseEntity.badRequest().body("Invalid signature");
            }

            // Process webhook payload
            JSONObject webhookData = new JSONObject(payload);
            String event = webhookData.getString("event");
            
            if ("payment.captured".equals(event)) {
                JSONObject payment = webhookData.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String orderId = payment.getString("order_id");
                String paymentId = payment.getString("id");
                
                Order order = orderRepository.findByRazorpayOrderId(orderId).orElse(null);
                if (order != null) {
                    order.setRazorpayPaymentId(paymentId);
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                }
            }
            
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Webhook processing failed");
        }
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

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<?> processRefund(@PathVariable String orderId, @RequestBody Map<String, Object> request) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not found"));
            }

            if (!Order.PaymentStatus.PAID.equals(order.getPaymentStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Order not paid"));
            }

            // Create refund via Razorpay
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue());
            refundRequest.put("speed", "normal");
            
            com.razorpay.Payment payment = razorpay.payments.fetch(order.getRazorpayPaymentId());
            com.razorpay.Refund refund = payment.createRefund(refundRequest);

            // Update order status
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                "message", "Refund processed successfully",
                "refundId", refund.get("id"),
                "amount", refund.get("amount")
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Refund failed: " + e.getMessage()));
        }
    }
}
