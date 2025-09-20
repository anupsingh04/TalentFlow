import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JobCard from "./JobCard";
import { useSearchParams } from "react-router-dom";
import { useState } from "react"; //1. Import useState
import Modal from "../../components/Modal"; //2. Import Modal
import JobForm from "./JobForm"; //3. Import JobForm

// This is the function that will fetch our data
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
  const queryClient = useQueryClient(); //make sure we have queryClient

  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";

  //4. Add state fot the modal and the job being edited
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Add the new mutation for toggling status
  const toggleJobStatusMutation = useMutation({
    mutationFn: async (job) => {
      const newStatus = job.status === "active" ? "archived" : "active";
      const response = await fetch(`/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update job status");
      }
    },
    onSuccess: () => {
      //Refetch the jobs list to see the change
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  //5. Add handlers to open close the modal
  const handleOpenCreateModal = () => {
    setJobToEdit(null); //Ensure we're in "create" mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setJobToEdit(null); //clear the job to edit
  };

  // useQuery will fetch, cache, and manage the state of our data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", { status, search, tag }], // A unique key for this query
    queryFn: fetchJobs, // The function to fetch the data
  });

  //Calculate unique tags from the data
  const allTags = data ? [...new Set(data.flatMap((job) => job.tags))] : [];

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Jobs Board</h2>
        {/* 6. Add Create Job button */}
        <button onClick={handleOpenCreateModal}>Create New Job</button>
      </div>

      {/* Filter UI start */}
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
      {/* Filter UI End */}

      <div>
        {data.map((job) => {
          //pass the edit handler to each JobCard and
          //pass the mutation trigger to the onToggleStatus prop
          return (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => handleOpenEditModal(job)}
              onToggleStatus={() => toggleJobStatusMutation.mutate(job)}
            />
          );
        })}
      </div>

      {/* 8. Render the Modal and JobForm */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={jobToEdit ? "Edit Job" : "Create Job"}
      >
        <JobForm onSuccess={handleCloseModal} jobToEdit={jobToEdit} />
      </Modal>
    </div>
  );
}

export default JobsList;
