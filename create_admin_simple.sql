-- Create new admin with RucPra@1588 password
INSERT INTO users (id, email, name, password_hash, role, email_verified, created_at) 
VALUES ('admin-pradha-2025', 'pradhafashionoutlet@gmail.com', 'Pradha Fashion Outlet Admin', '$2a$12$eKT1VDCy3qhOk5X48qYd5em5NO0b6qLupt6cznBWpNKzR8IP3Fnqi', 'ADMIN', true, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Remove old admin account
DELETE FROM users WHERE email = 'admin@pradha.com' AND role = 'ADMIN';

-- Verify admin exists
SELECT id, email, name, role, email_verified, created_at FROM users WHERE role = 'ADMIN';