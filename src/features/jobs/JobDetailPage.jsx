// src/features/jobs/JobDetailPage.jsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const fetchJob = async (jobId) => {
  const response = await fetch(`/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

function JobDetailPage() {
  const { jobId } = useParams();

  const {
    data: job,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(jobId),
  });

  if (isLoading) {
    return <div>Loading job details...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Link to="/">&larr; Back to Jobs List</Link>
      <h1>{job.title}</h1>
      <p>
        <strong>Status:</strong> {job.status}
      </p>
      <p>
        <strong>Description:</strong> {job.description}
      </p>
      <div>
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
    </div>
  );
}

export default JobDetailPage;
