import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Record } from "../../types/Record";
import { releaseYear } from "../../utils/releaseDate";
import styles from "./CollectionBreakdown.module.css";

interface Props {
  records: Record[];
}

interface YearDatum {
  year: number;
  count: number;
}

// teal #5eead4 -> blue #60a5fa, interpolated across the year range so the bars
// shift color left-to-right like a spectrum.
const FROM = [94, 234, 212];
const TO = [96, 165, 250];
function yearColor(t: number): string {
  const c = FROM.map((v, i) => Math.round(v + (TO[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function ByYearTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: YearDatum }[];
}) {
  if (!active || !payload?.length) return null;
  const { year, count } = payload[0].payload;
  if (count === 0) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipValue}>
        {count} {count === 1 ? "album" : "albums"}
      </span>
      <span className={styles.tooltipMeta}>Released in {year}</span>
    </div>
  );
}

export function CollectionByYear({ records }: Props) {
  const { data, min, max } = useMemo(() => {
    const years = records
      .map((r) => releaseYear(r))
      .filter((y): y is number => typeof y === "number" && y > 0);
    if (!years.length) return { data: [] as YearDatum[], min: 0, max: 0 };
    const min = Math.min(...years);
    const max = Math.max(...years);
    const counts = new Map<number, number>();
    for (const y of years) counts.set(y, (counts.get(y) ?? 0) + 1);
    const data: YearDatum[] = [];
    for (let y = min; y <= max; y++) data.push({ year: y, count: counts.get(y) ?? 0 });
    return { data, min, max };
  }, [records]);

  if (!data.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>By year</span>
        <span className={styles.rule} />
      </div>
      <div className={styles.yearChart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="year" hide />
            <Tooltip cursor={false} content={<ByYearTooltip />} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} minPointSize={2} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.count > 0 ? yearColor(i / (data.length - 1)) : "var(--divider)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.yearAxis}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </section>
  );
}
