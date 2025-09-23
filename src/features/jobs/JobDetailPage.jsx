// src/features/jobs/JobDetailPage.jsx
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// This function fetches a single job by its ID
const fetchJobById = async (jobId) => {
  const response = await fetch(`/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error("Job not found");
  }
  return response.json();
};

// New function to fetch candidates for this job
const fetchCandidatesByJob = async (jobId) => {
  const response = await fetch(`/jobs/${jobId}/candidates`);
  if (!response.ok) throw new Error("Could not fetch candidates");
  return response.json();
};

function JobDetailPage() {
  const { jobId } = useParams(); // Get the jobId from the URL parameter

  const {
    data: job,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["job", jobId], // A unique key for this specific job query
    queryFn: () => fetchJobById(jobId),
  });

  // New query to get the list of candidates for this job
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["jobCandidates", jobId],
    queryFn: () => fetchCandidatesByJob(jobId),
  });

  if (isLoading) {
    return <div>Loading job details...</div>;
  }

  if (isError) {
    return (
      <div>
        <h2>Error loading job</h2>
        <p>{error.message}</p>
        <Link to="/">Back to Jobs Board</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4">
        <Link to="/jobs" className="text-blue-600 hover:underline">
          &larr; Back to Jobs Board
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-500">Status: {job.status}</p>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Link to={`/jobs/${jobId}/assessment`}>
              <button className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Edit Assessment (HR)
              </button>
            </Link>
            <Link to={`/assessment/${jobId}`}>
              <button className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                Take Assessment (Candidate)
              </button>
            </Link>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-6">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Description
          </h2>
          <p>{job.description}</p>
        </div>

        <hr className="my-6" />

        {/* Candidate List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Candidates for this Job
          </h2>
          {isLoadingCandidates ? (
            <p>Loading candidates...</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {candidates?.map((c) => (
                <li key={c.id} className="py-3">
                  <Link
                    to={`/candidates/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {c.name}
                  </Link>
                  <span className="ml-4 text-sm text-gray-500">
                    ({c.stage})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;
