-- Fix hero_content table schema
DO $$
BEGIN
    -- Drop image column if it exists and is causing issues
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hero_content' AND column_name = 'image') THEN
        ALTER TABLE hero_content DROP COLUMN image;
    END IF;
    
    -- Ensure background_image_url column exists and is nullable
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hero_content' AND column_name = 'background_image_url') THEN
        ALTER TABLE hero_content ADD COLUMN background_image_url TEXT;
    END IF;
END
$$;