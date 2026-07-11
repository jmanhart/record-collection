import { Link } from "react-router-dom";
import { useActivity, toDateKey, type ActivityEvent } from "../../hooks/useActivity";
import { ListeningChart } from "./ListeningChart";
import { ActivityFeed } from "./ActivityFeed";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import styles from "./HomePage.module.css";

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

            <ListeningChart events={events} todayKey={todayKey} />
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
