import PropTypes from "prop-types";
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Keep attributes on the main div for dnd-kit
      className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
    >
      {/* Drag Handle */}
      <span
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </span>

      {/* Main Content */}
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            <Link to={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <div className="flex gap-2">
            {/* Secondary button style */}
            <button
              onClick={onToggleStatus}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              {job.status === "active" ? "Archive" : "Unarchive"}
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
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
