// src/features/candidates/KanbanCard.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";

function KanbanCard({ candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "4px",
    border: "1px solid #ccc",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{candidate.name}</strong>
      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>
        {candidate.email}
      </p>
    </div>
  );
}

KanbanCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default KanbanCard;
