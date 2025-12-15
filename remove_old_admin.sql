-- Create new admin with proper email
INSERT INTO users (id, email, name, password_hash, role, created_at) 
SELECT 'admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pradhafashionoutlet@gmail.com');

-- Remove old admin account
DELETE FROM users WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- Verify only new admin exists
SELECT id, email, name, role, created_at FROM users WHERE role = 'ADMIN';