/**
 * Normalize an NFC UID: strip colons/spaces, lowercase.
 * e.g. "04:A2:3B:1A:2C:5E:80" → "04a23b1a2c5e80"
 */
export function normalizeNfcUid(raw: string): string {
  return raw.replace(/[:\s-]/g, "").toLowerCase();
}

/**
 * Validate an NFC UID: 4-byte (8 hex), 7-byte (14 hex), or 10-byte (20 hex).
 */
export function isValidNfcUid(uid: string): boolean {
  return /^[0-9a-f]{8}$|^[0-9a-f]{14}$|^[0-9a-f]{20}$/.test(uid);
}

/**
 * Check if Web NFC API is available in the current browser.
 */
export function isWebNfcSupported(): boolean {
  return "NDEFReader" in window;
}

/**
 * Build the listen URL for a given NFC UID.
 */
export function buildListenUrl(nfcUid: string): string {
  return `https://records.manhart.io/listen/${nfcUid}`;
}
