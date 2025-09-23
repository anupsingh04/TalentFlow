import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import JobCard from "./JobCard";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import Modal from "../../components/Modal";
import JobForm from "./JobForm";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import JobCardSkeleton from "./JobCardSkeleton";
import toast from "react-hot-toast";
import styles from "./JobList.module.css";

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
  const [searchParams, setSearchParams] = useSearchParams(); //Get the search params from the URL
  const queryClient = useQueryClient(); //make sure we have queryClient

  //Add state for the client-side search term
  const [searchTerm, setSearchTerm] = useState("");

  // filter and page states
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const page = parseInt(searchParams.get("page") || "1", 10); //Get Page

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // useQuery will fetch, cache, and manage the state of our data
  const queryKey = ["jobs", { status, tag, page }];
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

  //Perform client-side search on the fetched & ordered data
  const filteredJobs = useMemo(() => {
    if (!orderedJobs) return [];
    if (!searchTerm) return orderedJobs;
    return orderedJobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderedJobs, searchTerm]);

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
      toast.success("Job status changed Successfully!");
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
      prev.set("page", "1"); // Reset to first page on filter change
      return prev;
    });
  };

  // The data object has changed shape, so we destructure it
  const jobs = data?.jobs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10); // Page size is 10
  //Calculate unique tags from the data
  const allTags = data?.jobs
    ? [...new Set(data.jobs.flatMap((job) => job.tags))]
    : [];
  const STATUSES = ["all", "active", "archived"];

  // Show a loading message while data is being fetched
  if (isLoading) {
    return (
      <div className="jobs-list">
        {/* ... Filter UI can be shown here if you want ... */}
        {/* Render 5 skeleton cards as placeholders */}
        {Array.from({ length: 5 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show an error message if the fetch fails
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header (no changes) */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Jobs Board</h2>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Job
        </button>
      </div>

      {/* Filter Controls Container */}
      {/* 3. The main container is now always a flex column to separate the rows */}
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6 flex flex-col gap-4">
        {/* 2. A new div wraps the first line of filters */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // 1. Added py-2 px-3 for more height and text padding
            className="block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
          />
          <select
            id="status-filter"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            // 1. Added py-2 px-3 to make the status dropdown bigger
            className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* The tag filters will now naturally fall onto the next line */}
        <div className="w-full flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => handleTagChange(t)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                tag === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {/* Filter UI End */}

      {/* Job Cards List & Pagination */}
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          No jobs found.
        </div>
      ) : (
        <>
          <DndContext /* ... */>
            <SortableContext
              items={filteredJobs.map((j) => j.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={() => handleOpenEditModal(job)}
                  onToggleStatus={() => toggleJobStatusMutation.mutate(job)}
                />
              ))}
            </SortableContext>
          </DndContext>
          {/* --- Add Pagination Controls --- */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
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
        </>
      )}

      {/* Render the Modal and JobForm */}
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
