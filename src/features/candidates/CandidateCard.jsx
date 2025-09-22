// src/features/candidates/CandidateCard.jsx
import PropTypes from "prop-types";
import styles from "./CandidateCard.module.css";

function CandidateCard({ candidate, style }) {
  // Get the initials for the avatar
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div style={style} className={styles.card}>
      <div className={styles.avatar}>{initials}</div>
      <div className={styles.info}>
        <p className={styles.name}>{candidate.name}</p>
        <p className={styles.email}>{candidate.email}</p>
      </div>
    </div>
  );
}

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  style: PropTypes.object.isRequired,
};

export default CandidateCard;
