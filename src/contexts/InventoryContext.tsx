import { createContext, useContext, ReactNode } from "react";
import { useSupabaseInventory, type InventoryContextValue } from "@/hooks/useSupabaseInventory";

export const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const value = useSupabaseInventory();
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventoryContext must be used within an InventoryProvider");
  }
  return context;
}
