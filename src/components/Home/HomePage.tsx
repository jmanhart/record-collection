import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useActivity, toDateKey, type ActivityEvent } from "../../hooks/useActivity";
import { StatCard, StatCardRow } from "../StatCard/StatCard";
import { ListeningChart } from "./ListeningChart";
import { ActivityFeed } from "./ActivityFeed";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import { formatRuntimeCompact } from "../../utils/formatDuration";
import styles from "./HomePage.module.css";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatHeroWhen(event: ActivityEvent, todayKey: string): string {
  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  if (event.dateKey === todayKey) return `Today · ${time}`;

  const [year, month, day] = event.dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: year !== Number(todayKey.slice(0, 4)) ? "numeric" : undefined,
  });
  return `${date} · ${time}`;
}

export default function HomePage() {
  const { events, isLoading } = useActivity();

  const todayKey = toDateKey(new Date().toISOString());

  const yearPrefix = `${todayKey.slice(0, 4)}-`;
  const yearStats = useMemo(() => {
    const yearListens = events.filter(
      (e) => e.type === "listen" && e.dateKey.startsWith(yearPrefix)
    );
    const albums = new Set(yearListens.map((e) => e.releaseId)).size;
    const seconds = yearListens.reduce(
      (sum, e) => sum + (e.record?.duration_seconds || 0),
      0
    );

    // Current Sun–Sat week, matching the calendar rows
    const [ty, tm, td] = todayKey.split("-").map(Number);
    const today = new Date(ty, tm - 1, td, 12);
    const weekStart = new Date(ty, tm - 1, td - today.getDay(), 12);
    const weekStartKey = `${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(
      weekStart.getDate()
    )}`;
    const weekSeconds = events
      .filter(
        (e) =>
          e.type === "listen" && e.dateKey >= weekStartKey && e.dateKey <= todayKey
      )
      .reduce((sum, e) => sum + (e.record?.duration_seconds || 0), 0);

    return { listens: yearListens.length, albums, seconds, weekSeconds };
  }, [events, yearPrefix, todayKey]);

  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      if (event.type !== "listen" || !event.dateKey.startsWith(yearPrefix)) continue;
      const artist = event.record?.artist;
      if (!artist) continue;
      counts.set(artist, (counts.get(artist) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist, count]) => ({ artist, count }));
  }, [events, yearPrefix]);

  const latestListen = events.find((e) => e.type === "listen");
  const heroRecord = latestListen?.record;
  const heroCover = heroRecord?.supabase_image_url || heroRecord?.coverImage;

  return (
    <div className={styles.shell}>
      <section className={styles.metricsPane}>
        <header className={styles.pageHeader}>
          <Link to="/" className={styles.backLink}>
            ← Collection
          </Link>
        </header>

        {isLoading ? (
          <p className={styles.status}>Loading...</p>
        ) : (
          <>
            {latestListen && heroRecord && (
              <Link
                to={`/${slugify(heroRecord.artist)}/${slugify(heroRecord.title)}`}
                className={styles.heroLink}
              >
                <div className={styles.hero}>
                  {heroCover ? (
                    <img src={heroCover} alt="" className={styles.heroCover} />
                  ) : (
                    <div className={styles.heroCoverPlaceholder} />
                  )}
                  <div className={styles.heroMain}>
                    <span className={styles.heroTitle}>
                      {heroRecord.title} — {heroRecord.artist}
                    </span>
                    <span className={styles.heroWhen}>
                      Latest listen · {formatHeroWhen(latestListen, todayKey)}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <StatCardRow>
              <StatCard
                size="sm"
                label="Listens this year"
                value={yearStats.listens}
                sub={`${yearStats.albums} different albums`}
              />
              <StatCard
                size="sm"
                label="Time listened"
                value={formatRuntimeCompact(yearStats.seconds)}
                sub="this year"
              />
              <StatCard
                size="sm"
                label="This week"
                value={formatRuntimeCompact(yearStats.weekSeconds)}
                sub="time listened"
              />
            </StatCardRow>

            <ListeningChart events={events} todayKey={todayKey} />

            {topArtists.length > 0 && (
              <div className={styles.topArtists}>
                <span className={styles.topArtistsLabel}>Top artists this year</span>
                <div className={styles.topArtistsList}>
                  {topArtists.map(({ artist, count }, index) => (
                    <div key={artist} className={styles.topArtistRow}>
                      <span className={styles.topArtistRank}>{index + 1}</span>
                      <span className={styles.topArtistName}>{artist}</span>
                      <span className={styles.topArtistCount}>
                        {count} {count === 1 ? "listen" : "listens"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.feedPane}>
        <div className={styles.feedHeader}>
          <h3 className={styles.feedTitle}>Activity</h3>
        </div>
        {isLoading ? (
          <p className={styles.status}>Loading...</p>
        ) : (
          <ActivityFeed events={events} todayKey={todayKey} />
        )}
      </section>
    </div>
  );
}
