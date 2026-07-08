import type { MouseEvent } from "react";
import { X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./HoverDeleteButton.module.css";

interface HoverDeleteButtonProps {
  onDelete: () => void;
  confirmMessage: string;
  label: string;
  isDeleting?: boolean;
  className?: string;
}

export function HoverDeleteButton({
  onDelete,
  confirmMessage,
  label,
  isDeleting = false,
  className,
}: HoverDeleteButtonProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(confirmMessage)) {
      onDelete();
    }
  };

  return (
    <Button
      type="button"
      variant="danger"
      icon
      aria-label={label}
      disabled={isDeleting}
      onClick={handleClick}
      className={`${styles.deleteButton} ${className ?? ""}`}
    >
      <X size={14} />
    </Button>
  );
}
