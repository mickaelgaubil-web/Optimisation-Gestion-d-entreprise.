/*
  # Create company profiles table

  ## Overview
  This migration creates the company_profiles table to store business information
  for each user in the OptiGest application.

  ## 1. New Tables
    - `company_profiles`
      - `id` (uuid, primary key): Unique identifier for the profile
      - `user_id` (uuid, foreign key): Reference to auth.users
      - `company_name` (text): Company legal name
      - `sector` (text): Business sector (Commerce, Services, etc.)
      - `employee_count` (integer): Number of employees
      - `revenue` (numeric): Annual revenue in euros
      - `fiscal_regime` (text): Fiscal regime (Micro-entreprise, IS, etc.)
      - `created_at` (timestamptz): Profile creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

  ## 2. Security
    - Enable RLS on `company_profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile
    - Add policy for users to delete their own profile

  ## 3. Important Notes
    - Each user can only have one company profile
    - All personal business data is protected by Row Level Security
    - Policies ensure users can only access their own data
*/

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  sector text NOT NULL,
  employee_count integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  fiscal_regime text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own company profile"
  ON company_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company profile"
  ON company_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON company_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON company_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
