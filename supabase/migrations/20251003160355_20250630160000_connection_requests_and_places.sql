/*
  # Create Connection Requests and Places Tables

  1. New Tables
    - `connection_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `proposal_type` (text)
      - `message` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `places`
      - `id` (serial, primary key)
      - `created_at` (timestamp)
      - `name` (jsonb for multilingual support)
      - `description` (jsonb for multilingual support)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `interest` (text)

  2. Security
    - Enable RLS on both tables
    - Connection requests: Users can view/manage their own requests
    - Places: Public read, authenticated users can create

  3. Indexes
    - Indexes on sender_id, receiver_id, status for connection_requests
    - Indexes on latitude, longitude for places
*/

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposal_type text NOT NULL CHECK (proposal_type IN ('Silent Walk', 'Tea & Soul Talk', 'Book Circle', 'Just Connect')),
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Connection request policies
CREATE POLICY "Users can view their own connection requests"
  ON connection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests"
  ON connection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests"
  ON connection_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- Create updated_at trigger for connection_requests
CREATE TRIGGER connection_requests_updated_at
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id serial PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  name jsonb NOT NULL,
  description jsonb NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  interest text NOT NULL
);

-- Enable RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Places policies
CREATE POLICY "Places are viewable by everyone"
  ON places
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create places"
  ON places
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for geospatial queries
CREATE INDEX IF NOT EXISTS idx_places_latitude ON places(latitude);
CREATE INDEX IF NOT EXISTS idx_places_longitude ON places(longitude);
CREATE INDEX IF NOT EXISTS idx_places_interest ON places(interest);