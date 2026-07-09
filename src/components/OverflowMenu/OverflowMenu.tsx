import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./OverflowMenu.module.css";

export interface OverflowMenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  confirmMessage?: string;
}

interface OverflowMenuProps {
  items: OverflowMenuItem[];
  label?: string;
  className?: string;
}

export function OverflowMenu({
  items,
  label = "More options",
  className,
}: OverflowMenuProps) {
  const handleSelect = (item: OverflowMenuItem) => {
    if (item.confirmMessage && !window.confirm(item.confirmMessage)) {
      return;
    }
    item.onSelect();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          icon
          aria-label={label}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align="end" sideOffset={4}>
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              className={`${styles.item} ${item.destructive ? styles.destructive : ""}`}
              onSelect={() => handleSelect(item)}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
