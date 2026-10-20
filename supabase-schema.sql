-- Supabase Database Schema for Paper Jam Creations
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom enums
CREATE TYPE material_category AS ENUM ('paper', 'ink', 'sticker', 'artboard', 'consumable', 'other');
CREATE TYPE unit AS ENUM ('sheet', 'ream', 'bottle', 'roll', 'packet', 'box', 'liter', 'milliliter', 'meter');
CREATE TYPE coverage_level AS ENUM ('low', 'medium', 'high', 'full');
CREATE TYPE project_status AS ENUM ('planning', 'in-progress', 'completed', 'cancelled');

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category material_category NOT NULL,
  sku TEXT,
  unit unit NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  base_unit_price DECIMAL(10, 4) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'planning',
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  markup DECIMAL(5, 2) NOT NULL DEFAULT 0,
  overhead_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  waste_buffer DECIMAL(5, 2) NOT NULL DEFAULT 0,
  page_count INTEGER NOT NULL DEFAULT 0,
  coverage_level coverage_level NOT NULL DEFAULT 'medium',
  -- Customer fields for quotation
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  quotation_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS)
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for shared access (both users can read/write everything)
-- Since this is for 2 users sharing data, we allow all authenticated users full access

CREATE POLICY "Authenticated users can view materials" ON materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert materials" ON materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update materials" ON materials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete materials" ON materials
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_low_stock ON materials(low_stock_threshold) WHERE quantity <= low_stock_threshold;
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);