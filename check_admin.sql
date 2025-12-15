-- Check all admin accounts
SELECT id, email, name, role, email_verified, created_at FROM users WHERE role = 'ADMIN';

-- Check all users with pradha emails
SELECT id, email, name, role, email_verified, created_at FROM users WHERE email LIKE '%pradha%';