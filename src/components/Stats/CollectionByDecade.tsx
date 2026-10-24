import { useMemo } from "react";
import type { Record } from "../../types/Record";
import styles from "./CollectionBreakdown.module.css";

interface Props {
  records: Record[];
}

// Cap covers per decade so dense decades (2010s/2020s) scroll instead of
// loading hundreds of images; the row scrolls horizontally for the rest.
const MAX_COVERS = 30;

interface DecadeRow {
  decade: number;
  count: number;
  covers: { id: number; src?: string; color?: string | null; title: string }[];
}

export function CollectionByDecade({ records }: Props) {
  const decades = useMemo<DecadeRow[]>(() => {
    const map = new Map<number, Record[]>();
    for (const r of records) {
      if (typeof r.year !== "number" || r.year <= 0) continue;
      const d = Math.floor(r.year / 10) * 10;
      (map.get(d) ?? map.set(d, []).get(d)!).push(r);
    }
    return [...map.entries()]
      .sort((a, b) => b[0] - a[0]) // newest decade first
      .map(([decade, recs]) => ({
        decade,
        count: recs.length,
        covers: recs
          .slice()
          .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
          .slice(0, MAX_COVERS)
          .map((r) => ({
            id: r.id,
            src: r.supabase_image_url || r.coverImage,
            color: r.dominant_color,
            title: r.title,
          })),
      }));
  }, [records]);

  if (!decades.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>By decade</span>
        <span className={styles.rule} />
      </div>
      <div className={styles.decades}>
        {decades.map((row) => (
          <div key={row.decade} className={styles.decadeRow}>
            <div className={styles.decadeMeta}>
              <span className={styles.decadeLabel}>{row.decade}s</span>
              <span className={styles.decadeCount}>
                {row.count} {row.count === 1 ? "album" : "albums"}
              </span>
            </div>
            <div className={styles.coverRow}>
              {row.covers.map((c) =>
                c.src ? (
                  <img
                    key={c.id}
                    src={c.src}
                    alt={c.title}
                    title={c.title}
                    className={styles.decadeCover}
                    loading="lazy"
                  />
                ) : (
                  <span
                    key={c.id}
                    className={styles.decadeCover}
                    style={{ background: c.color ?? "var(--surface200)" }}
                    title={c.title}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
