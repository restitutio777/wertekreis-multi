/*
  # Enable email visibility for connected users

  1. Security Policy
    - Add RLS policy to allow connected users to view each other's email addresses
    - Only users with accepted connection requests can see each other's emails

  2. Changes
    - Create policy on auth.users table for email visibility between connected users
    - Ensure proper security while maintaining privacy for non-connected users
*/

-- Create policy to allow connected users to view each other's email addresses
CREATE POLICY "Connected users can view each other's email"
ON auth.users
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own email
  auth.uid() = id
  OR
  -- Allow users to see email of users they have an accepted connection with
  EXISTS (
    SELECT 1 FROM public.connection_requests
    WHERE
      connection_requests.status = 'accepted'
      AND (
        (connection_requests.sender_id = auth.uid() AND connection_requests.receiver_id = auth.users.id)
        OR
        (connection_requests.receiver_id = auth.uid() AND connection_requests.sender_id = auth.users.id)
      )
  )
);