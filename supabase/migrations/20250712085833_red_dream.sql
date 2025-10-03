/*
  # Create Events Table and Security

  1. New Tables
    - `events`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())
      - `title` (text, required)
      - `description` (text, required)
      - `event_date` (date, required)
      - `event_time` (text, required)
      - `location` (text, required)
      - `image_url` (text, optional)
      - `category` (text, optional)
      - `website_link` (text, optional)
      - `contact_info` (text, optional)
      - `max_attendees` (integer, optional)
      - `created_by` (uuid, foreign key to profiles.id)

  2. Security
    - Enable RLS on `events` table
    - Add policies for public read access
    - Add policies for authenticated users to create events
    - Add policies for event creators to update/delete their own events

  3. Indexes
    - Add index on event_date for chronological ordering
    - Add index on category for filtering
    - Add index on created_by for user's events
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  event_time text NOT NULL,
  location text NOT NULL,
  image_url text,
  category text DEFAULT 'Allgemein',
  website_link text,
  contact_info text,
  max_attendees integer,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on RSVPs
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RSVP policies
CREATE POLICY "RSVPs are viewable by everyone"
  ON event_rsvps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage their RSVPs"
  ON event_rsvps
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for RSVPs
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);