// Web NFC API type declarations
// https://w3c.github.io/web-nfc/

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
  encoding?: string;
  lang?: string;
  toRecords?: () => NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

declare class NDEFReader {
  constructor();
  scan(options?: NDEFScanOptions): Promise<void>;
  write(
    message: string | BufferSource | NDEFMessageInit,
    options?: NDEFWriteOptions
  ): Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  addEventListener(
    type: "reading",
    listener: (event: NDEFReadingEvent) => void
  ): void;
  addEventListener(type: "readingerror", listener: (event: Event) => void): void;
  removeEventListener(
    type: "reading",
    listener: (event: NDEFReadingEvent) => void
  ): void;
  removeEventListener(
    type: "readingerror",
    listener: (event: Event) => void
  ): void;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: string | BufferSource | NDEFMessageInit;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
