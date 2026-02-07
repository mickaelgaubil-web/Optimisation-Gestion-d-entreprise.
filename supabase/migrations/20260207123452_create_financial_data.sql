/*
  # Create financial data table

  ## Overview
  This migration creates the financial_data table to store financial indicators
  for each fiscal year and user in the OptiGest application.

  ## 1. New Tables
    - `financial_data`
      - `id` (uuid, primary key): Unique identifier for the financial record
      - `user_id` (uuid, foreign key): Reference to auth.users
      - `year` (integer): Fiscal year (e.g., 2024, 2025)
      - `revenue` (numeric): Annual revenue in euros
      - `fixed_costs` (numeric): Fixed costs in euros
      - `variable_costs` (numeric): Variable costs in euros
      - `payroll` (numeric): Total payroll expenses in euros
      - `cash_flow` (numeric): Available cash flow in euros
      - `notes` (text): Optional notes and comments
      - `created_at` (timestamptz): Record creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

  ## 2. Security
    - Enable RLS on `financial_data` table
    - Add policy for users to read their own financial data
    - Add policy for users to insert their own financial data
    - Add policy for users to update their own financial data
    - Add policy for users to delete their own financial data

  ## 3. Important Notes
    - Users can have multiple records (one per fiscal year)
    - All financial data is protected by Row Level Security
    - Policies ensure users can only access their own data
    - Default values prevent null entries for numeric fields
*/

-- Create financial_data table
CREATE TABLE IF NOT EXISTS financial_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  revenue numeric DEFAULT 0 NOT NULL,
  fixed_costs numeric DEFAULT 0 NOT NULL,
  variable_costs numeric DEFAULT 0 NOT NULL,
  payroll numeric DEFAULT 0 NOT NULL,
  cash_flow numeric DEFAULT 0 NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable Row Level Security
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own financial data"
  ON financial_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial data"
  ON financial_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial data"
  ON financial_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial data"
  ON financial_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_year ON financial_data(year);
CREATE INDEX IF NOT EXISTS idx_financial_data_user_year ON financial_data(user_id, year);
