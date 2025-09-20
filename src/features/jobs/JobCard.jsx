// src/features/jobs/JobCard.jsx
import PropTypes from "prop-types";
import styles from "./JobCard.module.css";

function JobCard({ job, onEdit }) {
  return (
    <div className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>{job.title}</h3>
        <button onClick={onEdit}>Edit</button> {/* Add Edit button */}
      </div>
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
  onEdit: PropTypes.func.isRequired,
};

export default JobCard;
