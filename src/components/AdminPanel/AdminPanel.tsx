import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useNfcTags } from "../../hooks/useNfcTags";
import { useListens } from "../../hooks/useListens";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { Search } from "../Search/Search";
import { Button } from "../Button/Button";
import { NfcPairingDialog } from "../NfcPairingDialog/NfcPairingDialog";
import { LogListenDialog } from "../LogListenDialog/LogListenDialog";
import { RecordMetadataEditor } from "./RecordMetadataEditor";
import { StatCard, StatCardRow } from "../StatCard/StatCard";
import { formatDateOnly } from "../../utils/timezone";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./AdminPanel.module.css";

type AdminSortField = "artist" | "listens" | "nfc" | "favorite" | "location" | "acquired";
type AdminSortOrder = "asc" | "desc";
type StatFilter = "nfc-unlinked" | "missing-duration" | null;

export function AdminPanel() {
  const { records, isLoading } = useRecords();
  const { hasNfcTag, getNfcTag } = useNfcTags();
  const { listens } = useListens();
  const { logout } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<AdminSortField>("artist");
  const [sortOrder, setSortOrder] = useState<AdminSortOrder>("asc");
  const [statFilter, setStatFilter] = useState<StatFilter>(null);

  const listenCountsByReleaseId = useMemo(() => {
    const map = new Map<number, number>();
    for (const listen of listens) {
      map.set(listen.release_id, (map.get(listen.release_id) ?? 0) + 1);
    }
    return map;
  }, [listens]);

  const stats = useMemo(() => {
    const total = records.length;
    const nfcLinked = records.filter((r) => hasNfcTag(r.id)).length;
    const totalSeconds = records.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
    const missingDuration = records.filter((r) => !r.duration_seconds).length;
    return {
      total,
      nfcLinked,
      nfcPercent: total > 0 ? Math.round((nfcLinked / total) * 100) : 0,
      totalSeconds,
      missingDuration,
    };
  }, [records, hasNfcTag]);

  const filtered = useMemo(() => {
    let result = records;
    if (statFilter === "nfc-unlinked") {
      result = result.filter((r) => !hasNfcTag(r.id));
    } else if (statFilter === "missing-duration") {
      result = result.filter((r) => !r.duration_seconds);
    }
    const query = search.trim().toLowerCase();
    if (!query) return result;
    return result.filter(
      (r) =>
        r.artist.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query)
    );
  }, [records, search, statFilter, hasNfcTag]);

  const toggleStatFilter = (filter: Exclude<StatFilter, null>) => {
    setStatFilter((current) => (current === filter ? null : filter));
  };

  const sorted = useMemo(() => {
    const withMeta = filtered.map((record) => ({
      record,
      listens: listenCountsByReleaseId.get(record.id) ?? 0,
      nfc: hasNfcTag(record.id) ? 1 : 0,
      favorite: record.is_favorite ? 1 : 0,
      location: record.purchase_location ?? "",
      acquired: record.acquired_at ? new Date(record.acquired_at).getTime() : 0,
    }));

    withMeta.sort((a, b) => {
      let diff = 0;
      if (sortField === "artist") {
        diff = a.record.artist.localeCompare(b.record.artist);
      } else if (sortField === "listens") {
        diff = a.listens - b.listens;
      } else if (sortField === "nfc") {
        diff = a.nfc - b.nfc;
      } else if (sortField === "favorite") {
        diff = a.favorite - b.favorite;
      } else if (sortField === "location") {
        diff = a.location.localeCompare(b.location);
      } else {
        diff = a.acquired - b.acquired;
      }
      return sortOrder === "asc" ? diff : -diff;
    });

    return withMeta.map((entry) => entry.record);
  }, [filtered, listenCountsByReleaseId, hasNfcTag, sortField, sortOrder]);

  const selected = records.find((r) => r.id === selectedId) ?? null;

  const handleSort = (field: AdminSortField) => {
    if (field === sortField) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortArrow = (field: AdminSortField) =>
    sortField === field ? (
      <span className={styles.sortArrow}>{sortOrder === "asc" ? "↑" : "↓"}</span>
    ) : null;

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

      <div className={styles.layout}>
        <div className={styles.left}>
          <Search value={search} onChange={setSearch} placeholder="Search records..." />

          <StatCardRow>
            <StatCard
              label="NFC linked"
              value={isLoading ? "—" : `${stats.nfcPercent}%`}
              meterPercent={stats.nfcPercent}
              sub={
                statFilter === "nfc-unlinked"
                  ? "showing unlinked"
                  : `${stats.nfcLinked} of ${stats.total} linked`
              }
              onClick={() => toggleStatFilter("nfc-unlinked")}
              active={statFilter === "nfc-unlinked"}
              title="Filter the table to records without an NFC tag"
            />
            <StatCard
              label="Collection"
              value={isLoading ? "—" : stats.total}
              sub="records"
            />
            <StatCard
              label="Total runtime"
              value={isLoading ? "—" : formatRuntimeCompact(stats.totalSeconds)}
              sub={
                stats.totalSeconds >= 86400
                  ? `${(stats.totalSeconds / 86400).toFixed(1)} days of music`
                  : "of music"
              }
            />
            <StatCard
              label="Missing track length"
              value={isLoading ? "—" : stats.missingDuration}
              sub={statFilter === "missing-duration" ? "showing these" : "need durations"}
              onClick={() => toggleStatFilter("missing-duration")}
              active={statFilter === "missing-duration"}
              title="Filter the table to records without a track length"
            />
          </StatCardRow>

          {isLoading ? (
            <p className={styles.status}>Loading records...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("artist")}
                      >
                        Record {sortArrow("artist")}
                      </button>
                    </th>
                    <th className={styles.listensCol}>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("listens")}
                      >
                        Listens {sortArrow("listens")}
                      </button>
                    </th>
                    <th className={styles.nfcCol}>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("nfc")}
                      >
                        NFC {sortArrow("nfc")}
                      </button>
                    </th>
                    <th className={styles.favoriteCol}>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("favorite")}
                      >
                        ★ {sortArrow("favorite")}
                      </button>
                    </th>
                    <th className={styles.locationCol}>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("location")}
                      >
                        Purchase location {sortArrow("location")}
                      </button>
                    </th>
                    <th className={styles.acquiredCol}>
                      <button
                        className={styles.sortButton}
                        onClick={() => handleSort("acquired")}
                      >
                        Acquired {sortArrow("acquired")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((record) => (
                    <tr
                      key={record.id}
                      className={`${styles.row} ${
                        selectedId === record.id ? styles.rowActive : ""
                      }`}
                      onClick={() => setSelectedId(record.id)}
                    >
                      <td>
                        <div className={styles.recordArtist}>{record.artist}</div>
                        <div className={styles.recordTitle}>{record.title}</div>
                      </td>
                      <td className={styles.listensCell}>
                        {listenCountsByReleaseId.get(record.id) ?? 0}
                      </td>
                      <td className={styles.nfcCell}>
                        {hasNfcTag(record.id) && (
                          <Check size={16} className={styles.nfcCheck} />
                        )}
                      </td>
                      <td className={styles.favoriteCell}>
                        {record.is_favorite && (
                          <Star size={16} fill="currentColor" className={styles.favoriteCheck} />
                        )}
                      </td>
                      <td className={styles.locationCell}>
                        {record.purchase_location || "—"}
                      </td>
                      <td className={styles.acquiredCell}>
                        {record.acquired_at
                          ? formatDateOnly(record.acquired_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sorted.length === 0 && (
                <p className={styles.status}>
                  {search.trim()
                    ? `No records match "${search}"`
                    : "No records match the current filter"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.detailPane}>
          {selected && (
            <>
              <h2>
                {selected.artist} — {selected.title}
              </h2>
              <div className={styles.actions}>
                <NfcPairingDialog releaseId={selected.id} existingTag={getNfcTag(selected.id)} />
                <LogListenDialog releaseId={selected.id} title={selected.title} artist={selected.artist} />
              </div>
              <RecordMetadataEditor record={selected} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
