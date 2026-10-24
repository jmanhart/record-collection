import { useMemo } from "react";
import type { Record } from "../../types/Record";
import { releaseYear } from "../../utils/releaseDate";
import styles from "./CollectionBreakdown.module.css";

interface Props {
  records: Record[];
}

interface DecadeRow {
  decade: number;
  count: number;
  covers: { id: number; src?: string; color?: string | null; title: string }[];
}

export function CollectionByDecade({ records }: Props) {
  const decades = useMemo<DecadeRow[]>(() => {
    const map = new Map<number, Record[]>();
    for (const r of records) {
      const year = releaseYear(r);
      if (!year) continue;
      const d = Math.floor(year / 10) * 10;
      const bucket = map.get(d);
      if (bucket) bucket.push(r);
      else map.set(d, [r]);
    }
    return [...map.entries()]
      .sort((a, b) => b[0] - a[0]) // newest decade first
      .map(([decade, recs]) => ({
        decade,
        count: recs.length,
        covers: recs
          .slice()
          .sort((a, b) => (releaseYear(a) ?? 0) - (releaseYear(b) ?? 0))
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
