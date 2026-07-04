import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Nfc, Copy, Check, Scan } from "lucide-react";
import { useNfcTags } from "../../hooks/useNfcTags";
import { normalizeNfcUid, isValidNfcUid, isWebNfcSupported, buildListenUrl } from "../../utils/nfc";
import type { NfcTag } from "../../services/supabase";
import styles from "./NfcPairingDialog.module.css";

interface NfcPairingDialogProps {
  releaseId: number;
  existingTag?: NfcTag;
}

type Tab = "scan" | "manual";

export function NfcPairingDialog({ releaseId, existingTag }: NfcPairingDialogProps) {
  const { pairTag, unpairTag, isPairing, isUnpairing } = useNfcTags();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(isWebNfcSupported() ? "scan" : "manual");
  const [manualUid, setManualUid] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [writeWarning, setWriteWarning] = useState("");

  const isPaired = !!existingTag;
  const listenUrl = existingTag ? buildListenUrl(existingTag.nfc_uid) : "";

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleManualPair = async () => {
    setError("");
    const normalized = normalizeNfcUid(manualUid);
    if (!isValidNfcUid(normalized)) {
      setError("Invalid UID. Must be 8, 14, or 20 hex characters.");
      return;
    }
    try {
      await pairTag({ nfcUid: normalized, releaseId });
      setManualUid("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unique") || msg.includes("duplicate")) {
        setError("This tag is already linked to another record.");
      } else {
        setError(msg);
      }
    }
  };

  const handleScan = async () => {
    setError("");
    setScanning(true);
    setWriteWarning("");
    try {
      const reader = new NDEFReader();
      const controller = new AbortController();

      reader.addEventListener("reading", async (event: NDEFReadingEvent) => {
        controller.abort();
        setScanning(false);
        const uid = normalizeNfcUid(event.serialNumber);

        if (!isValidNfcUid(uid)) {
          setError("Could not read a valid UID from this tag.");
          return;
        }

        try {
          await pairTag({ nfcUid: uid, releaseId });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("unique") || msg.includes("duplicate")) {
            setError("This tag is already linked to another record.");
          } else {
            setError(msg);
          }
          return;
        }

        // Try to write URL to the tag
        try {
          const writeReader = new NDEFReader();
          await writeReader.write({
            records: [{ recordType: "url", data: buildListenUrl(uid) }],
          });
        } catch {
          setWriteWarning("Paired, but could not write URL to tag. Copy it manually below.");
        }
      });

      await reader.scan({ signal: controller.signal });

      // Timeout after 30 seconds
      setTimeout(() => {
        controller.abort();
        setScanning(false);
      }, 30000);
    } catch {
      setScanning(false);
      setError("Could not start NFC scan. Make sure NFC is enabled.");
    }
  };

  const handleUnpair = async () => {
    if (!existingTag) return;
    try {
      await unpairTag(existingTag.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setError("");
      setWriteWarning("");
      setManualUid("");
      setCopied(false);
      setScanning(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className={`${styles.trigger} ${isPaired ? styles.triggerPaired : styles.triggerUnpaired}`}>
          <Nfc size={16} />
          {isPaired ? "NFC Linked" : "Link NFC Tag"}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>
            {isPaired ? "NFC Tag Linked" : "Link NFC Tag"}
          </Dialog.Title>

          {isPaired ? (
            <div className={styles.pairedInfo}>
              <div>
                <p className={styles.label}>Tag UID</p>
                <span className={styles.tagUid}>{existingTag.nfc_uid}</span>
              </div>

              <div>
                <p className={styles.label}>Listen URL</p>
                <div className={styles.urlDisplay}>
                  <span className={styles.urlText}>{listenUrl}</span>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopy(listenUrl)}
                    title="Copy URL"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <button
                  className={`${styles.button} ${styles.buttonDanger}`}
                  onClick={handleUnpair}
                  disabled={isUnpairing}
                >
                  {isUnpairing ? "Unlinking..." : "Unlink Tag"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tabs}>
                {isWebNfcSupported() && (
                  <button
                    className={`${styles.tab} ${activeTab === "scan" ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab("scan")}
                  >
                    Scan with Phone
                  </button>
                )}
                <button
                  className={`${styles.tab} ${activeTab === "manual" ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab("manual")}
                >
                  Enter Manually
                </button>
              </div>

              {activeTab === "scan" && (
                <div className={styles.section}>
                  <p className={styles.instructions}>
                    Hold an NFC tag against the back of your phone. The tag UID will be read and
                    the listen URL will be written to the tag.
                  </p>
                  <button
                    className={`${styles.button} ${styles.buttonPrimary} ${styles.scanButton} ${scanning ? styles.scanning : ""}`}
                    onClick={handleScan}
                    disabled={scanning || isPairing}
                  >
                    <Scan size={16} />
                    {scanning ? "Scanning..." : "Start Scan"}
                  </button>
                </div>
              )}

              {activeTab === "manual" && (
                <div className={styles.section}>
                  <p className={styles.instructions}>
                    Paste the Serial Number from your NFC tag (hex, with or without colons).
                  </p>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      className={`${styles.input} ${error ? styles.inputError : ""}`}
                      value={manualUid}
                      onChange={(e) => {
                        setManualUid(e.target.value);
                        setError("");
                      }}
                      placeholder="04a23b1a2c5e80"
                      maxLength={20}
                    />
                    <button
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      onClick={handleManualPair}
                      disabled={!manualUid.trim() || isPairing}
                    >
                      {isPairing ? "Linking..." : "Link"}
                    </button>
                  </div>
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}
              {writeWarning && <p className={styles.error}>{writeWarning}</p>}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
