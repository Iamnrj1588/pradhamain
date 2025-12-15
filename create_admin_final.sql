-- Create new admin with proper email and password Pradha@1588
INSERT INTO users (id, email, name, password_hash, role, created_at) 
SELECT 'admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Fq4j/rw5c/2e7H4t4UCD2zbJWQcubC', 'ADMIN', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pradhafashionoutlet@gmail.com');

-- Remove old admin account
DELETE FROM users WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- Verify only new admin exists
SELECT id, email, name, role, created_at FROM users WHERE role = 'ADMIN';