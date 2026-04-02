import styles from "./Tabs.module.css";

export type TabValue = "collection" | "wishlist";

interface TabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === "collection" ? styles.active : ""}`}
        onClick={() => onTabChange("collection")}
      >
        Collection
      </button>
      <button
        className={`${styles.tab} ${activeTab === "wishlist" ? styles.active : ""}`}
        onClick={() => onTabChange("wishlist")}
      >
        Wishlist
      </button>
    </div>
  );
}
