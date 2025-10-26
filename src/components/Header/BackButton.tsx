import styles from "./BackButton.module.css";

interface BackButtonProps {
  mainSiteUrl?: string;
}

export function BackButton({ mainSiteUrl = "/" }: BackButtonProps) {
  return (
    <a className={styles.heroImage} href={mainSiteUrl}>
      <img
        src="/self-03.png"
        alt="Self portrait"
      />
    </a>
  );
}

