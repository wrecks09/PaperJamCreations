export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MaterialCategory =
  | "paper"
  | "ink"
  | "sticker"
  | "artboard"
  | "consumable"
  | "other"

export type Unit =
  | "sheet"
  | "ream"
  | "bottle"
  | "roll"
  | "packet"
  | "box"
  | "liter"
  | "milliliter"
  | "meter"

export type CoverageLevel = "low" | "medium" | "high" | "full"

export type ProjectStatus = "planning" | "in-progress" | "completed" | "cancelled"

export interface Database {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string
          name: string
          category: MaterialCategory
          sku: string | null
          unit: Unit
          quantity: number
          unit_price: number
          base_unit_price: number
          low_stock_threshold: number
          supplier: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: MaterialCategory
          sku?: string | null
          unit: Unit
          quantity: number
          unit_price: number
          base_unit_price: number
          low_stock_threshold: number
          supplier?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: MaterialCategory
          sku?: string | null
          unit?: Unit
          quantity?: number
          unit_price?: number
          base_unit_price?: number
          low_stock_threshold?: number
          supplier?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: ProjectStatus
          materials: Json
          labor_cost: number
          markup: number
          overhead_cost: number
          waste_buffer: number
          page_count: number
          coverage_level: CoverageLevel
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          customer_address: string | null
          quotation_number: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status: ProjectStatus
          materials: Json
          labor_cost: number
          markup: number
          overhead_cost: number
          waste_buffer: number
          page_count: number
          coverage_level: CoverageLevel
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          quotation_number?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: ProjectStatus
          materials?: Json
          labor_cost?: number
          markup?: number
          overhead_cost?: number
          waste_buffer?: number
          page_count?: number
          coverage_level?: CoverageLevel
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          quotation_number?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      material_category: MaterialCategory
      unit: Unit
      coverage_level: CoverageLevel
      project_status: ProjectStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}