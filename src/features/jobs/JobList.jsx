// src/features/jobs/JobsList.jsx
import { useQuery } from "@tanstack/react-query";
import JobCard from "./JobCard";

// This is the function that will fetch our data
const fetchJobs = async () => {
  const response = await fetch("/jobs");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

function JobsList() {
  // useQuery will fetch, cache, and manage the state of our data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"], // A unique key for this query
    queryFn: fetchJobs, // The function to fetch the data
  });

  // Show a loading message while data is being fetched
  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  // Show an error message if the fetch fails
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="jobs-list">
      <h2>Jobs Board</h2>
      <div>
        {data.map((job) => {
          return <JobCard key={job.id} job={job} />;
        })}
      </div>
    </div>
  );
}

export default JobsList;
