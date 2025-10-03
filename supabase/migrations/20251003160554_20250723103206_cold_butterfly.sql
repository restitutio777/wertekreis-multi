/*
  # Add contribution field to profiles table

  1. Schema Changes
    - Add `contribution` column to `profiles` table
      - `contribution` (jsonb, nullable) - User's optional contribution statement with multilingual support

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
    - Users can update their own contribution field through existing policies

  3. Notes
    - This field is optional and allows users to describe their skills and how they help others
    - Supports multilingual content via JSONB
*/

-- Add contribution column to profiles table with JSONB for multilingual support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contribution'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contribution jsonb;
  END IF;
END $$;

-- Also update bio to JSONB if it's still text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio' AND data_type = 'text'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN bio TYPE jsonb USING 
      CASE 
        WHEN bio IS NULL THEN NULL
        ELSE jsonb_build_object('de', bio)
      END;
  END IF;
END $$;