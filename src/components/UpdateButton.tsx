import React, { useState } from "react";
import { updateSupabase } from "../api/updateSupabase";
import styles from "./UpdateButton.module.css";

export function UpdateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const result = await updateSupabase();
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleUpdate}
        disabled={isLoading}
        className={styles.button}
      >
        {isLoading ? "Updating..." : "Update Collection"}
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
