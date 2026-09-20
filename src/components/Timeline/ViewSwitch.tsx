import { LayoutGrid, Clock } from "lucide-react";
import styles from "./ViewSwitch.module.css";

interface ViewSwitchProps {
  view: "grid" | "timeline";
  onToggle: (next: "grid" | "timeline") => void;
}

/**
 * Fixed icon toggle between the collection grid and the timeline, sitting
 * beside the theme toggle and sharing its look. Shows the view it switches to.
 */
export function ViewSwitch({ view, onToggle }: ViewSwitchProps) {
  const toTimeline = view === "grid";
  return (
    <button
      type="button"
      className={styles.viewSwitch}
      aria-label={toTimeline ? "Switch to timeline" : "Switch to collection"}
      onClick={() => onToggle(toTimeline ? "timeline" : "grid")}
    >
      {toTimeline ? <Clock size={20} /> : <LayoutGrid size={20} />}
    </button>
  );
}
