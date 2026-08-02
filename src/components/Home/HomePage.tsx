import { Link } from "react-router-dom";
import { useActivity, toDateKey } from "../../hooks/useActivity";
import { ListeningChart } from "./ListeningChart";
import { ActivityFeed } from "./ActivityFeed";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { events, isLoading } = useActivity();

  const todayKey = toDateKey(new Date().toISOString());

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
          <ListeningChart events={events} todayKey={todayKey} />
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
