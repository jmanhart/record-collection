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

export function LogListenDialog({ releaseId, title, artist }: LogListenDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleConfirm = async () => {
    setLogging(true);
    try {
      await logListen(releaseId, "manual");
      await queryClient.invalidateQueries({ queryKey: ["listen-count", releaseId] });
      await queryClient.invalidateQueries({ queryKey: ["listens"] });
      setOpen(false);
    } catch (e) {
      console.error("Failed to log listen:", e);
    } finally {
      setLogging(false);
    }
  };

  const now = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost">Log Listen</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>Log a Listen</Dialog.Title>
          <p className={styles.description}>
            Log a listen for <strong>{title}</strong> by <strong>{artist}</strong> at{" "}
            <strong>{now}</strong>?
          </p>
          <div className={styles.actions}>
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={logging}
            >
              {logging ? "Logging..." : "Confirm"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
