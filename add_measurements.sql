-- Add measurement columns to rental_bookings table
ALTER TABLE rental_bookings 
ADD COLUMN IF NOT EXISTS chest_measurement VARCHAR(10),
ADD COLUMN IF NOT EXISTS waist_measurement VARCHAR(10),
ADD COLUMN IF NOT EXISTS hip_measurement VARCHAR(10),
ADD COLUMN IF NOT EXISTS customization_notes TEXT;