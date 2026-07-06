import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRecords } from "../../hooks/useRecords";
import { useNfcTags } from "../../hooks/useNfcTags";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Search } from "../Search/Search";
import { Button } from "../Button/Button";
import { NfcPairingDialog } from "../NfcPairingDialog/NfcPairingDialog";
import { LogListenDialog } from "../LogListenDialog/LogListenDialog";
import type { Record } from "../../types/Record";
import styles from "./AdminPanel.module.css";

export function AdminPanel() {
  const { records, isLoading } = useRecords();
  const { getNfcTag } = useNfcTags();
  const { logout } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter(
      (r) =>
        r.artist.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query)
    );
  }, [records, search]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin</h1>
        <div className={styles.headerActions}>
          <Link to="/" className={styles.backLink}>
            ← Back to collection
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <Search value={search} onChange={setSearch} placeholder="Search records..." />

      {isLoading ? (
        <p className={styles.status}>Loading records...</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((record) => (
            <li key={record.id}>
              <button
                className={`${styles.recordButton} ${
                  selected?.id === record.id ? styles.recordButtonActive : ""
                }`}
                onClick={() => setSelected(record)}
              >
                <span className={styles.recordArtist}>{record.artist}</span>
                <span className={styles.recordTitle}>{record.title}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <p className={styles.status}>No records match "{search}"</p>
          )}
        </ul>
      )}

      {selected && (
        <div className={styles.selectedPanel}>
          <h2>
            {selected.artist} — {selected.title}
          </h2>
          <div className={styles.actions}>
            <NfcPairingDialog releaseId={selected.id} existingTag={getNfcTag(selected.id)} />
            <LogListenDialog releaseId={selected.id} title={selected.title} artist={selected.artist} />
          </div>
        </div>
      )}
    </div>
  );
}
