import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JobCard from "./JobCard";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import JobForm from "./JobForm";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// This is the function that will fetch our data
const fetchJobs = async ({ queryKey }) => {
  // Destructure the queryKey to get the status and search parameters
  const [_key, { status, search, tag, page }] = queryKey;
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);
  if (tag) params.append("tag", tag);
  if (page) params.append("page", page); // Add page to the URL params

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

  // filter and page states
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const page = parseInt(searchParams.get("page") || "1", 10); //Get Page

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // useQuery will fetch, cache, and manage the state of our data
  const queryKey = ["jobs", { status, search, tag, page }];
  const { data, isLoading, isError, error } = useQuery({
    queryKey, // A unique key for this query
    queryFn: fetchJobs, // The function to fetch the data
  });

  // Add local state to manage the visual order of jobs for dnd
  const [orderedJobs, setOrderedJobs] = useState([]);
  useEffect(() => {
    if (data?.jobs) {
      setOrderedJobs(data.jobs);
    }
  }, [data]);

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

  //Create the mutation for reordering with optimistic updates
  const reorderMutation = useMutation({
    mutationFn: ({ activeId, overId }) => {
      // This function just calls the API
      return fetch(`/jobs/${activeId}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeId, overId }), // Send necessary data
      });
    },
    // This onMutate function is the core of the optimistic update
    onMutate: async ({ active, over }) => {
      // A. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // B. Snapshot the previous value
      const previousJobsData = queryClient.getQueryData(queryKey);

      // C. Optimistically update to the new value
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return;
        const oldJobs = oldData.jobs;
        const oldIndex = oldJobs.findIndex((j) => j.id === active.id);
        const newIndex = oldJobs.findIndex((j) => j.id === over.id);
        const newJobsArray = arrayMove(oldJobs, oldIndex, newIndex);
        return { ...oldData, jobs: newJobsArray };
      });

      // D. Return a context object with the snapshotted value
      return { previousJobsData };
    },
    // E. If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      console.error("Rollback due to error:", err);
      queryClient.setQueryData(queryKey, context.previousJobsData);
    },
    // F. Always refetch after error or success to ensure server state is synced
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Handle the drag end event from DndContext
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      // First, update our local state for a smooth UI experience
      setOrderedJobs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });

      // Then, trigger the mutation to tell the server
      reorderMutation.mutate({
        active,
        over,
        activeId: active.id,
        overId: over.id,
      });
    }
  }

  // Modal Handlers
  //Add handlers to open close the modal
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

  // The data object has changed shape, so we destructure it
  const jobs = data?.jobs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10); // Page size is 10
  //Calculate unique tags from the data
  const allTags = data?.jobs
    ? [...new Set(data.jobs.flatMap((job) => job.tags))]
    : [];

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent invalid page numbers
    setSearchParams((prev) => {
      prev.set("page", newPage);
      return prev;
    });
  };

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
        {/* 5. Wrap the list in the DndContext and SortableContext */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedJobs.map((j) => j.id)}
            strategy={verticalListSortingStrategy}
          >
            {/* 6. Map over the local 'orderedJobs' state */}
            {orderedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={() => handleOpenEditModal(job)}
                onToggleStatus={() => toggleJobStatusMutation.mutate(job)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* --- Add Pagination Controls --- */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span style={{ margin: "0 15px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
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
