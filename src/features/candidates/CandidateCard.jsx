// src/features/candidates/CandidateCard.jsx
import PropTypes from "prop-types";
import styles from "./CandidateCard.module.css";
import { Link } from "react-router-dom"; //Import link to make card clickable

function CandidateCard({ candidate, style }) {
  // Get the initials for the avatar
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    // Wrap the card in a Link component and apply the positioning style to it
    <Link
      to={`/candidates/${candidate.id}`}
      className={styles.cardLink}
      style={style}
    >
      <div className={styles.card}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.info}>
          <p className={styles.name}>{candidate.name}</p>
          <p className={styles.email}>{candidate.email}</p>
        </div>
      </div>
    </Link>
  );
}

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  style: PropTypes.object.isRequired,
};

export default CandidateCard;
