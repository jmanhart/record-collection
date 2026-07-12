import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { logListen } from "../../services/supabase";
import { Button } from "../Button/Button";
import styles from "./LogListenDialog.module.css";

interface LogListenDialogProps {
  releaseId: number;
  title: string;
  artist: string;
}

// datetime-local wants "YYYY-MM-DDTHH:MM" in local time; minute precision
function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function LogListenDialog({ releaseId, title, artist }: LogListenDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [when, setWhen] = useState("");

  const whenIsValid = when !== "" && !Number.isNaN(new Date(when).getTime());

  const handleOpenChange = (nextOpen: boolean) => {
    // Prefill with the moment the dialog opens, fresh on every open
    if (nextOpen) setWhen(toDateTimeLocalValue(new Date()));
    setOpen(nextOpen);
  };

  const handleConfirm = async () => {
    if (!whenIsValid) return;
    setLogging(true);
    try {
      await logListen(releaseId, "manual", new Date(when).toISOString());
      await queryClient.invalidateQueries({ queryKey: ["listen-count", releaseId] });
      await queryClient.invalidateQueries({ queryKey: ["listens"] });
      setOpen(false);
    } catch (e) {
      console.error("Failed to log listen:", e);
    } finally {
      setLogging(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button variant="ghost">Log Listen</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>Log a Listen</Dialog.Title>
          <p className={styles.description}>
            Log a listen for <strong>{title}</strong> by <strong>{artist}</strong>
          </p>
          <label className={styles.whenField}>
            <span className={styles.whenLabel}>When</span>
            <input
              type="datetime-local"
              className={styles.whenInput}
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
          </label>
          <div className={styles.actions}>
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={logging || !whenIsValid}
            >
              {logging ? "Logging..." : "Confirm"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
