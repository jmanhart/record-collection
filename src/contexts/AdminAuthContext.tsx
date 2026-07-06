import { useState, type ReactNode } from "react";
import { AdminAuthContext } from "./adminAuthContextDefinition";

const STORAGE_KEY = "admin-authenticated";
const GATE_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  const login = (password: string): boolean => {
    if (!GATE_PASSWORD || password !== GATE_PASSWORD) return false;
    localStorage.setItem(STORAGE_KEY, "true");
    setIsAdmin(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAdmin, isConfigured: !!GATE_PASSWORD, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
