import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import styles from "./CircleLink.module.css";

interface CircleLinkProps {
  to: string;
  /** Accessible label; the button is icon-only. */
  label: string;
  /** Far-right corner slot, or one button to its left. */
  placement?: "corner" | "beside";
  children: ReactNode;
}

/**
 * Fixed, icon-only circular link matching the ViewSwitch look. Used both to
 * enter the Top Listens route (beside the collection controls) and to return
 * to the collection from it (in the corner).
 */
export function CircleLink({ to, label, placement = "corner", children }: CircleLinkProps) {
  return (
    <Link to={to} aria-label={label} className={`${styles.button} ${styles[placement]}`}>
      {children}
    </Link>
  );
}
