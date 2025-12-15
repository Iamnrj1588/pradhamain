-- Create admin with working admin123 password
INSERT INTO users (id, email, name, password_hash, role, email_verified, created_at) 
VALUES ('admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Remove old admin account
DELETE FROM users WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- Verify admin exists
SELECT id, email, name, role, email_verified, created_at FROM users WHERE role = 'ADMIN';