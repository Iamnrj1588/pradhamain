# Pradha Main - Java Spring Boot Backend

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Database Setup
1. Install PostgreSQL
2. Create database: `CREATE DATABASE pradhadb;`
3. Update credentials in `.env` file

### Running the Application
```bash
mvn spring-boot:run
```

### API Endpoints
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- GET `/api/products` - Get products
- GET `/api/products/{id}` - Get product by ID
- POST `/api/products` - Create product

### Environment Variables
- `DB_USERNAME` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - JWT signing secret