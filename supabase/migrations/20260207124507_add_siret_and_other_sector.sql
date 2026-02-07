/*
  # Add SIRET and other sector fields to company profiles

  ## Overview
  This migration adds SIRET/SIREN identification number and a field for custom
  sector description when "Autre" is selected.

  ## 1. Changes to Tables
    - `company_profiles`
      - Add `siret` (text): SIRET or SIREN identification number
      - Add `other_sector_description` (text): Custom sector description when "Autre" is selected

  ## 2. Important Notes
    - SIRET field is optional as some users might not have it yet
    - other_sector_description is only used when sector = "Autre"
    - No changes to existing security policies needed
*/

-- Add SIRET field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_profiles' AND column_name = 'siret'
  ) THEN
    ALTER TABLE company_profiles ADD COLUMN siret text DEFAULT '';
  END IF;
END $$;

-- Add other_sector_description field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_profiles' AND column_name = 'other_sector_description'
  ) THEN
    ALTER TABLE company_profiles ADD COLUMN other_sector_description text DEFAULT '';
  END IF;
END $$;
