import PropTypes from "prop-types";
import styles from "./JobCard.module.css";
import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

//Add 'onToggleStatus' as props
function JobCard({ job, onEdit, onToggleStatus }) {
  // Use the useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: job.id });

  // Apply styles for the drag-and-drop animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 2. Create a new drag handle element and give IT the listeners. */}
          <span {...listeners} className={styles.dragHandle}>
            ⠿
          </span>
          <h3>
            <Link to={`/jobs/${job.id}`} className={styles.jobTitleLink}>
              {job.title}
            </Link>
          </h3>
        </div>
        <div>
          {/* Add archive/unarchive button */}
          <button onClick={onToggleStatus} style={{ marginRight: "10px" }}>
            {job.status === "active" ? "Archive" : "Unarchive"}
          </button>
          <button onClick={onEdit}>Edit</button> {/* Add Edit button */}
        </div>
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
  onToggleStatus: PropTypes.func.isRequired,
};

export default JobCard;
