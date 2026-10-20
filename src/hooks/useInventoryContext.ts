import { useContext } from "react";
import { InventoryContext } from "@/contexts/InventoryContext";

export function useInventoryContext() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventoryContext must be used within an InventoryProvider");
  }
  return ctx;
}
