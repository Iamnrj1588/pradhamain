-- Update admin email from admin@pradha.com to pradhafashionoutlet@gmail.com
UPDATE users 
SET email = 'pradhafashionoutlet@gmail.com', 
    name = 'Pradha Fashion Outlet Admin'
WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- If no admin exists with old email, create new admin
INSERT INTO users (id, email, name, password_hash, role, created_at) 
SELECT 'admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'pradhafashionoutlet@gmail.com'
);

-- Verify the update
SELECT id, email, name, role, created_at FROM users WHERE role = 'ADMIN';