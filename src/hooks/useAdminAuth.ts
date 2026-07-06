import { useContext } from "react";
import { AdminAuthContext } from "../contexts/adminAuthContextDefinition";

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
