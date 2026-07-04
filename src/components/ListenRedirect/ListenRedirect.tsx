import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logListen } from "../../services/supabase";
import { useNfcTags } from "../../hooks/useNfcTags";
import { useRecords } from "../../hooks/useRecords";
import { slugify } from "../../utils/slugify";

export function ListenRedirect() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { nfcTags, isLoading: isLoadingTags } = useNfcTags();
  const { records, isLoading: isLoadingRecords } = useRecords();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoadingTags || isLoadingRecords || !uid) return;

    const tag = nfcTags.find((t) => t.nfc_uid === uid);
    if (!tag) {
      setError("Unknown NFC tag.");
      return;
    }

    const record = records.find((r) => r.id === tag.release_id);

    // Log the listen
    logListen(tag.release_id).catch(console.error);

    // Redirect to the record detail page
    if (record) {
      navigate(`/${slugify(record.artist)}/${slugify(record.title)}`, { replace: true });
    } else {
      setError("Record not found.");
    }
  }, [uid, nfcTags, records, isLoadingTags, isLoadingRecords, navigate]);

  if (error) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>{error}</div>;
  }

  return <div style={{ padding: "2rem", textAlign: "center" }}>Logging listen...</div>;
}
