import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { useRecords } from "../../hooks/useRecords";
import { useArticle } from "../../hooks/useArticle";
import { useNfcTags } from "../../hooks/useNfcTags";
import { getListenCount } from "../../services/supabase";
import { hasArticle } from "../../content/articles/articleIds";
import { slugify } from "../../utils/slugify";
import { NfcPairingDialog } from "../NfcPairingDialog/NfcPairingDialog";
import styles from "./RecordDetail.module.css";

export function RecordDetail() {
  const { artist, album } = useParams();
  const { records } = useRecords();
  const record = records?.find(
    (r) => slugify(r.artist) === artist && slugify(r.title) === album
  );

  const { article, isLoading: isLoadingArticle } = useArticle(record?.id);
  const { getNfcTag } = useNfcTags();
  const nfcTag = record ? getNfcTag(record.id) : undefined;

  const { data: listenCount } = useQuery({
    queryKey: ["listen-count", record?.id],
    queryFn: () => getListenCount(record!.id),
    enabled: !!nfcTag && !!record,
  });

  if (!record) {
    return (
      <div className={styles.container}>
        <p>Record not found</p>
        <Link to="/" className={styles.backLink}>
          ← Back to collection
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={record.supabase_image_url || record.coverImage}
          alt={`${record.title} cover`}
          className={styles.cover}
        />
        <div className={styles.info}>
          <h1>{record.title}</h1>
          <h2>{record.artist}</h2>
          {nfcTag && (
            <p className={styles.listenCount}>
              {listenCount ?? 0} {listenCount === 1 ? "listen" : "listens"}
            </p>
          )}
        </div>
      </div>

      <div className={styles.nfcSection}>
        <NfcPairingDialog releaseId={record.id} existingTag={nfcTag} />
      </div>

      {(isLoadingArticle || article) && (
        <div className={styles.article}>
          {isLoadingArticle ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            article && (
              <div className={styles.markdown}>
                <article.Content />
              </div>
            )
          )}
        </div>
      )}

      {import.meta.env.DEV && !isLoadingArticle && hasArticle(String(record.id)) ? (
        <div className={styles.editHint}>
          <code>src/content/articles/{record.id}.mdx</code>
        </div>
      ) : import.meta.env.DEV && !isLoadingArticle && !article ? (
        <div className={styles.writePrompt}>
          <PenLine size={20} className={styles.writePromptIcon} />
          <p className={styles.writePromptText}>Got a story about this record?</p>
          <code className={styles.writePromptCommand}>npm run article:new {record.id}</code>
          <span className={styles.writePromptPath}>src/content/articles/{record.id}.mdx</span>
        </div>
      ) : null}
    </div>
  );
}
