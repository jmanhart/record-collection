import { createContext } from "react";

export interface AdminAuthValue {
  isAdmin: boolean;
  isConfigured: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthValue | null>(null);
