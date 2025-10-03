/*
  # Add contribution field to profiles table

  1. Schema Changes
    - Add `contribution` column to `profiles` table
      - `contribution` (text, nullable) - User's optional contribution statement

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
    - Users can update their own contribution field through existing policies

  3. Notes
    - This field is optional and allows users to describe their skills and how they help others
    - Follows the suggested format: "Ich kann [Fähigkeit] und helfe damit [Zielgruppe] dabei, [Problem zu lösen]"
*/

-- Add contribution column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contribution'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contribution text;
  END IF;
END $$;