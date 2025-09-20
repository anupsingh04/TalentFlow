import { useQuery } from "@tanstack/react-query";
import JobCard from "./JobCard";
import { useSearchParams } from "react-router-dom"; //1. Import useSearchParams

// This is the function that will fetch our data
// 2. Update fetchJobs to accept filters
const fetchJobs = async ({ queryKey }) => {
  // Destructure the queryKey to get the status and search parameters
  const [_key, { status, search, tag }] = queryKey;
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);
  if (tag) params.append("tag", tag);

  const response = await fetch(`/jobs?${params.toString()}`);
  // const response = await fetch("/jobs");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

function JobsList() {
  const [searchParams, setSearchParams] = useSearchParams(); //3. Get the search params from the URL

  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";

  // useQuery will fetch, cache, and manage the state of our data
  //4. Make the query key dependent on the filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", { status, search, tag }], // A unique key for this query
    queryFn: fetchJobs, // The function to fetch the data
  });

  //Calculate unique tags from the data
  const allTags = data ? [...new Set(data.flatMap((job) => job.tags))] : [];

  //5. Create handler function to update the url
  const handleTagChange = (newTag) => {
    setSearchParams((prev) => {
      if (prev.get("tag") === newTag) {
        prev.delete("tag"); //click again to clear
      } else {
        prev.set("tag", newTag);
      }
      return prev;
    });
  };

  const handleStatusChange = (newStatus) => {
    setSearchParams((prev) => {
      prev.set("status", newStatus);
      return prev;
    });
  };

  const handleSearchChange = (event) => {
    const newSearch = event.target.value;
    setSearchParams((prev) => {
      if (newSearch) {
        prev.set("search", newSearch);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

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
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={handleSearchChange}
        />
        <button onClick={() => handleStatusChange("all")}>All</button>
        <button onClick={() => handleStatusChange("active")}>Active</button>
        <button onClick={() => handleStatusChange("archived")}>Archived</button>
      </div>
      {/* Add this new block for tag filters */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <p style={{ margin: 0 }}>Filter by tag:</p>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => handleTagChange(t)}
            style={{ background: tag === t ? "#cce5ff" : "#f0f0f0" }}
          >
            {t}
          </button>
        ))}
      </div>
      <div>
        {data.map((job) => {
          return <JobCard key={job.id} job={job} />;
        })}
      </div>
    </div>
  );
}

export default JobsList;
