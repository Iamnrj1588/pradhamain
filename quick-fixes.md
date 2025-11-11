# Quick Fixes for Checkout System

## Database Issues
```sql
-- If tables don't exist, run:
\i e:/pradhamain/database_checkout_tables.sql

-- Check if tables exist:
\dt orders
\dt order_items
```

## Frontend Issues
```bash
# If Razorpay not loading:
npm install --save-dev @types/razorpay

# If components not found:
cd frontend
npm start
```

## Backend Issues
```bash
# If Razorpay dependency missing:
cd backend-java
mvn clean install
mvn spring-boot:run
```

## Test Payment Details
- Card: 4111 1111 1111 1111
- Expiry: 12/25
- CVV: 123
- Name: Test User

## API Endpoints to Test
- POST /api/checkout/create-order
- POST /api/checkout/verify-payment  
- GET /api/checkout/orders
- GET /api/cart
- POST /api/cart