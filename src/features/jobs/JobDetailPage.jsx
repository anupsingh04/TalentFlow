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
    <div>
      <Link to="/jobs">&larr; Back to Jobs Board</Link>
      <h1>{job.title}</h1>
      <p>
        <strong>Status:</strong> {job.status}
      </p>
      <p>
        <strong>Description:</strong> {job.description}
      </p>
      <div>
        <strong>Tags:</strong>
        {job.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: "#eee",
              padding: "4px 8px",
              borderRadius: "4px",
              marginRight: "4px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      {/* Updated section with both links */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <Link to={`/jobs/${jobId}/assessment`}>
          <button>Edit Assessment (HR)</button>
        </Link>
        <Link to={`/assessment/${jobId}`}>
          <button>Take Assessment (Candidate)</button>
        </Link>
      </div>
      <hr />
      <h2>Candidates for this Job</h2>
      {isLoadingCandidates ? (
        <p>Loading candidates...</p>
      ) : (
        <ul>
          {candidates?.map((c) => (
            <li key={c.id}>
              <Link to={`/candidates/${c.id}`}>{c.name}</Link> ({c.stage})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default JobDetailPage;
