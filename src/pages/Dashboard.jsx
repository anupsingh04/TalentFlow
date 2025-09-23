// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";

// Simple SVG icons for demonstration
const JobsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const CandidatesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A10.004 10.004 0 003 16V6a3 3 0 013-3h12a3 3 0 013 3v6.354"
    />
  </svg>
);

function Dashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Welcome to TalentFlow
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Select a section to begin managing your hiring process.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Jobs Card */}
        <Link
          to="/jobs"
          className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-6">
            <JobsIcon />
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Manage Jobs
              </h2>
              <p className="text-gray-500 mt-1">
                Create, edit, and organize all job postings.
              </p>
            </div>
          </div>
        </Link>

        {/* Candidates Card */}
        <Link
          to="/candidates"
          className="block p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-6">
            <CandidatesIcon />
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Manage Candidates
              </h2>
              <p className="text-gray-500 mt-1">
                View applicants and move them through the hiring pipeline.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
