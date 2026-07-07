import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useTagOptions } from "../../hooks/useTagOptions";
import { usePurchaseLocationOptions } from "../../hooks/usePurchaseLocationOptions";
import { Select } from "../common/Select";
import { Button } from "../Button/Button";
import type { Record } from "../../types/Record";
import styles from "./RecordMetadataEditor.module.css";

const NEW_LOCATION_VALUE = "__new__";

interface RecordMetadataEditorProps {
  record: Record;
}

export function RecordMetadataEditor({ record }: RecordMetadataEditorProps) {
  const { updateRecord } = useRecords();
  const { options: tagOptions, createOption: createTagOption } = useTagOptions();
  const { options: locationOptions, createOption: createLocationOption } =
    usePurchaseLocationOptions();

  const [addingLocation, setAddingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const savedDate = record.acquired_at ? record.acquired_at.slice(0, 10) : "";
  const [dateInput, setDateInput] = useState(savedDate);

  useEffect(() => {
    setDateInput(savedDate);
  }, [record.id, savedDate]);

  const save = (updates: Partial<Record>) => {
    updateRecord({ id: String(record.id), updates });
  };

  const toggleFavorite = () => {
    save({ is_favorite: !record.is_favorite });
  };

  const commitDate = () => {
    if (dateInput !== savedDate) {
      save({ acquired_at: dateInput || null });
    }
  };

  const handleLocationChange = (value: string) => {
    if (value === NEW_LOCATION_VALUE) {
      setAddingLocation(true);
      return;
    }
    save({ purchase_location: value || null });
  };

  const handleAddLocation = async () => {
    const name = newLocationName.trim();
    if (!name) return;
    const existing = locationOptions.find(
      (o) => o.name.toLowerCase() === name.toLowerCase()
    );
    const finalName = existing ? existing.name : (await createLocationOption(name)).name;
    save({ purchase_location: finalName });
    setNewLocationName("");
    setAddingLocation(false);
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const currentTags = record.tags ?? [];
    const existing = tagOptions.find(
      (o) => o.name.toLowerCase() === name.toLowerCase()
    );
    const finalName = existing ? existing.name : (await createTagOption(name)).name;
    if (!currentTags.some((t) => t.toLowerCase() === finalName.toLowerCase())) {
      save({ tags: [...currentTags, finalName] });
    }
    setNewTagName("");
  };

  const handleRemoveTag = (tag: string) => {
    save({ tags: (record.tags ?? []).filter((t) => t !== tag) });
  };

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <button
          className={`${styles.favoriteButton} ${
            record.is_favorite ? styles.favoriteActive : ""
          }`}
          onClick={toggleFavorite}
          type="button"
        >
          <Star size={16} fill={record.is_favorite ? "currentColor" : "none"} />
          Favorite
        </button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Acquired</label>
        <input
          type="date"
          className={styles.dateInput}
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onBlur={commitDate}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Purchase location</label>
        {addingLocation ? (
          <div className={styles.inlineAdd}>
            <input
              type="text"
              className={styles.textInput}
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="New location name"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={handleAddLocation}>
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddingLocation(false);
                setNewLocationName("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Select
            value={record.purchase_location ?? ""}
            onChange={handleLocationChange}
            options={[
              { value: "", label: "— None —" },
              ...locationOptions.map((o) => ({ value: o.name, label: o.name })),
              { value: NEW_LOCATION_VALUE, label: "+ Add new location..." },
            ]}
          />
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tags</label>
        <div className={styles.chips}>
          {(record.tags ?? []).map((tag) => (
            <span key={tag} className={styles.chip}>
              {tag}
              <button
                className={styles.chipRemove}
                onClick={() => handleRemoveTag(tag)}
                type="button"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className={styles.inlineAdd}>
          <input
            type="text"
            className={styles.textInput}
            list="tag-options-list"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag..."
          />
          <datalist id="tag-options-list">
            {tagOptions.map((o) => (
              <option key={o.id} value={o.name} />
            ))}
          </datalist>
          <Button variant="ghost" size="sm" onClick={handleAddTag}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
