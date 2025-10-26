import { useNavigate } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

export function Breadcrumb() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <div className={styles.breadcrumb} onClick={handleClick}>
      <span className={styles.prettyPath}>record-collection</span>
    </div>
  );
}

