/*
  # Create storage bucket for documents

  ## Overview
  This migration creates a storage bucket for fiscal documents (PDFs)
  uploaded by users in the OptiGest application.

  ## 1. New Storage Buckets
    - `documents`: Storage bucket for fiscal documents
      - PDF files (liasses fiscales, bilans, comptes de résultats)
      - Files are organized by user ID
      - Maximum file size: 10MB per file

  ## 2. Important Notes
    - Files are stored in paths like: fiscal-documents/user-id-timestamp.pdf
    - Only PDF files should be uploaded to this bucket
    - Bucket policies will be configured through Supabase Dashboard
*/

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
