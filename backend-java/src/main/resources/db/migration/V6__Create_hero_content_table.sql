-- Check if hero_content table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hero_content') THEN
        CREATE TABLE hero_content (
            id BIGSERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NOT NULL,
            background_image_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hero_content' AND column_name = 'background_image_url') THEN
            ALTER TABLE hero_content ADD COLUMN background_image_url TEXT;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hero_content' AND column_name = 'is_active') THEN
            ALTER TABLE hero_content ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hero_content' AND column_name = 'display_order') THEN
            ALTER TABLE hero_content ADD COLUMN display_order INTEGER DEFAULT 0;
        END IF;
    END IF;
END
$$;