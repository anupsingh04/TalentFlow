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
    // The positioning style from the virtualizer is applied to the Link
    <Link
      to={`/candidates/${candidate.id}`}
      style={style}
      className="block no-underline text-current group relative"
    >
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-b border-gray-200">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">{candidate.name}</p>
          <p className="text-gray-500 text-sm">{candidate.email}</p>
        </div>
      </div>
      {/* Add the hidden tooltip that appears on group-hover */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none capitalize">
        {candidate.stage}
      </div>
    </Link>
  );
}

CandidateCard.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    stage: PropTypes.string.isRequired,
  }).isRequired,
  style: PropTypes.object.isRequired,
};

export default CandidateCard;
