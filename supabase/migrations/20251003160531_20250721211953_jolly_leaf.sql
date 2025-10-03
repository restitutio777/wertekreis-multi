/*
  # Create messages table for private messaging

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `content` (text, message content)
      - `conversation_id` (uuid, for grouping messages between users)
      - `is_read` (boolean, for read status)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for authenticated users to insert their own messages
    - Add policy for participants to read messages in their conversations
    - Add policy to prevent messaging unless users are connected

  3. Functions
    - Function to generate consistent conversation_id for user pairs
    - Function to check if users are connected before allowing messages

  4. Indexes
    - Index on conversation_id for fast message retrieval
    - Index on created_at for chronological ordering
    - Index on sender_id and receiver_id for user queries
*/

-- Function to generate consistent conversation ID for any two users
CREATE OR REPLACE FUNCTION generate_conversation_id(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
BEGIN
  -- Create a consistent UUID by combining the two user IDs in alphabetical order
  -- This ensures the same conversation_id regardless of who initiates the conversation
  IF user1_id < user2_id THEN
    RETURN uuid_generate_v5(uuid_ns_oid(), user1_id::text || user2_id::text);
  ELSE
    RETURN uuid_generate_v5(uuid_ns_oid(), user2_id::text || user1_id::text);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if two users are connected (have accepted connection request)
CREATE OR REPLACE FUNCTION users_are_connected(user1_id uuid, user2_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM connection_requests
    WHERE status = 'accepted'
    AND (
      (sender_id = user1_id AND receiver_id = user2_id) OR
      (sender_id = user2_id AND receiver_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  conversation_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  
  -- Ensure sender and receiver are different
  CONSTRAINT different_users CHECK (sender_id != receiver_id),
  
  -- Ensure content is not empty
  CONSTRAINT non_empty_content CHECK (length(trim(content)) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Composite index for efficient conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert messages (only if users are connected)
CREATE POLICY "Allow connected users to send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    users_are_connected(sender_id, receiver_id)
  );

-- Policy: Allow participants to read messages in their conversations
CREATE POLICY "Allow participants to read conversation messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id) AND
    users_are_connected(sender_id, receiver_id)
  );

-- Policy: Allow users to update read status of messages sent to them
CREATE POLICY "Allow users to mark messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Trigger to automatically set conversation_id before insert
CREATE OR REPLACE FUNCTION set_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.conversation_id = generate_conversation_id(NEW.sender_id, NEW.receiver_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_set_conversation_id
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_conversation_id();

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation_id(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN generate_conversation_id(user1_id, user2_id);
END;
$$ LANGUAGE plpgsql;

-- View for easy conversation retrieval with participant info
CREATE OR REPLACE VIEW conversation_messages AS
SELECT 
  m.*,
  sender.display_name as sender_name,
  sender.username as sender_username,
  receiver.display_name as receiver_name,
  receiver.username as receiver_username
FROM messages m
JOIN profiles sender ON m.sender_id = sender.id
JOIN profiles receiver ON m.receiver_id = receiver.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT SELECT ON conversation_messages TO authenticated;
GRANT EXECUTE ON FUNCTION generate_conversation_id(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION users_are_connected(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_id(uuid, uuid) TO authenticated;