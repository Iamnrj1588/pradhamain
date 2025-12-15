-- Create new admin with all required fields
INSERT INTO users (id, email, name, password_hash, role, email_verified, created_at) 
SELECT 'admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Fq4j/rw5c/2e7H4t4UCD2zbJWQcubC', 'ADMIN', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pradhafashionoutlet@gmail.com');

-- Remove old admin account
DELETE FROM users WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- Verify only new admin exists
SELECT id, email, name, role, email_verified, created_at FROM users WHERE role = 'ADMIN';