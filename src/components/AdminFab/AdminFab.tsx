import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, ArrowLeft } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useNfcTags } from "../../hooks/useNfcTags";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Search } from "../Search/Search";
import { NfcPairingDialog } from "../NfcPairingDialog/NfcPairingDialog";
import { LogListenDialog } from "../LogListenDialog/LogListenDialog";
import type { Record } from "../../types/Record";
import styles from "./AdminFab.module.css";

export function AdminFab() {
  const { isAdmin } = useAdminAuth();
  const { records } = useRecords();
  const { getNfcTag } = useNfcTags();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter(
      (r) =>
        r.artist.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query)
    );
  }, [records, search]);

  const selected: Record | null = records.find((r) => r.id === selectedId) ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearch("");
      setSelectedId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className={styles.fab} aria-label="Quick add">
          <Plus size={24} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            {selected ? (
              <button
                className={styles.backButton}
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft size={18} />
                Back to search
              </button>
            ) : (
              <Dialog.Title className={styles.title}>Quick Add</Dialog.Title>
            )}
            <Dialog.Close asChild>
              <button className={styles.closeButton} aria-label="Close">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {selected ? (
            <div className={styles.detail}>
              <p className={styles.detailTitle}>
                {selected.artist} — {selected.title}
              </p>
              <div className={styles.actions}>
                <NfcPairingDialog releaseId={selected.id} existingTag={getNfcTag(selected.id)} />
                <LogListenDialog releaseId={selected.id} title={selected.title} artist={selected.artist} />
              </div>
            </div>
          ) : (
            <>
              <Search value={search} onChange={setSearch} placeholder="Search records..." />
              <div className={styles.results}>
                {filtered.map((record) => (
                  <button
                    key={record.id}
                    className={styles.resultRow}
                    onClick={() => setSelectedId(record.id)}
                  >
                    <span className={styles.resultArtist}>{record.artist}</span>
                    <span className={styles.resultTitle}>{record.title}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className={styles.empty}>No records match "{search}"</p>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
