import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Square } from "lucide-react";
import { useActivity, toDateKey, type ActivityEvent } from "../../hooks/useActivity";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { endListen } from "../../services/supabase";
import { ListeningChart } from "./ListeningChart";
import { ActivityFeed } from "./ActivityFeed";
import { Button } from "../Button/Button";
import { slugify } from "../../utils/slugify";
import { TIMEZONE } from "../../utils/timezone";
import styles from "./HomePage.module.css";

// Mirrors listen_details: playing = no explicit end, and still inside the
// inferred window (duration + 5 min flip slack; 45 min fallback)
function isStillPlaying(event: ActivityEvent): boolean {
  if (event.endedAt) return false;
  const durationMs = ((event.record?.duration_seconds ?? 2700) + 300) * 1000;
  return Date.now() < new Date(event.timestamp).getTime() + durationMs;
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
  const { isAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isStopping, setIsStopping] = useState(false);

  const todayKey = toDateKey(new Date().toISOString());

  const latestListen = events.find((e) => e.type === "listen");

  const handleEndListen = async () => {
    setIsStopping(true);
    try {
      await endListen();
      await queryClient.invalidateQueries({ queryKey: ["listens"] });
    } catch (error) {
      console.error("Error ending listen:", error);
    } finally {
      setIsStopping(false);
    }
  };
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
              <div className={styles.hero}>
                <Link
                  to={`/${slugify(heroRecord.artist)}/${slugify(heroRecord.title)}`}
                  className={styles.heroLink}
                >
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
                </Link>
                {isAdmin && isStillPlaying(latestListen) && (
                  <Button
                    variant="ghost"
                    icon
                    aria-label="End listen"
                    title="Mark this record as stopped"
                    onClick={handleEndListen}
                    disabled={isStopping}
                  >
                    <Square size={16} />
                  </Button>
                )}
              </div>
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
