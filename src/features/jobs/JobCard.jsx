// src/features/jobs/JobCard.jsx
import PropTypes from "prop-types";
import styles from "./JobCard.module.css";

function JobCard({ job }) {
  return (
    <div className={styles.card}>
      <h3>{job.title}</h3>
      <p>Status: {job.status}</p>
      <div className={styles.tags}>
        {job.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// Add prop-types for validation
JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default JobCard;
