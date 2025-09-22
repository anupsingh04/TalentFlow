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
      {/* Add a link to the assessment builder */}
      <div style={{ marginTop: "20px" }}>
        <Link to={`/jobs/${jobId}/assessment`}>
          <button>Edit Assessment</button>
        </Link>
      </div>
    </div>
  );
}

export default JobDetailPage;
