# Database Setup Instructions

## 1. Install PostgreSQL
Download and install PostgreSQL from: https://www.postgresql.org/download/

## 2. Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE pradhadb;

-- Create user (optional)
CREATE USER pradha_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pradhadb TO pradha_user;

-- Exit
\q
```

## 3. Run Schema
```bash
# Connect to the database
psql -U postgres -d pradhadb

# Run the schema file
\i schema.sql

# Or copy-paste the schema.sql content
```

## 4. Update Application Configuration
Update `application.yml` with your database credentials:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pradhadb
    username: postgres  # or pradha_user
    password: your_password
```

## 5. Verify Setup
Run the Spring Boot application and check the logs for successful database connection.