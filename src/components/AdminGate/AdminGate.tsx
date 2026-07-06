import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../Button/Button";
import styles from "./AdminGate.module.css";

const GATE_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = "admin-authenticated";

interface AdminGateProps {
  children: ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!GATE_PASSWORD) {
    return (
      <div className={styles.container}>
        <div className={styles.box}>
          <h2>Configuration error</h2>
          <p className={styles.subtitle}>
            VITE_ADMIN_PASSWORD is not set for this environment.
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === GATE_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2>Admin Access</h2>
        <p className={styles.subtitle}>Enter the password to continue</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.input}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" variant="primary">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
