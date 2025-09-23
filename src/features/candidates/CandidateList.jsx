// src/features/candidates/CandidateList.jsx
import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import CandidateCard from "./CandidateCard";
import styles from "./CandidateCard.module.css";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";
import CandidateForm from "./CandidateForm";

// Data fetching function for candidates
const fetchCandidates = async ({ queryKey }) => {
  const [_key, { stage }] = queryKey;
  const params = new URLSearchParams();
  if (stage && stage !== "all") {
    params.append("stage", stage);
  }
  const response = await fetch(`/candidates?${params.toString()}`);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

function CandidateList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stage = searchParams.get("stage") || "all";

  // Fetch data from the API
  const {
    data: candidates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["candidates", { stage }],
    queryFn: fetchCandidates,
  });

  // Client-side search logic
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (!searchTerm) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  // Ref for the scrolling container
  const parentRef = useRef();

  // Set up the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 75, // Estimate the height of each row
    overscan: 5, // Render 5 extra items above and below the visible area
  });

  const handleStageChange = (newStage) => {
    setSearchParams((prev) => {
      prev.set("stage", newStage);
      return prev;
    });
  };

  const STAGES = [
    "all",
    "applied",
    "screen",
    "tech",
    "offer",
    "hired",
    "rejected",
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Candidates</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Candidate
          </button>
          <Link
            to="/candidates/kanban"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Kanban Board
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
        />
        <div className="w-full md:w-auto">
          <label htmlFor="stage-filter" className="sr-only">
            Filter by stage:
          </label>
          <select
            id="stage-filter"
            onChange={(e) => handleStageChange(e.target.value)}
            value={stage}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate List Container */}
      {isLoading ? (
        <div>Loading candidates...</div> // Skeletons could be added here later
      ) : isError ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm text-red-600">
          Error loading candidates. Please try again.
        </div>
      ) : (
        <div
          ref={parentRef}
          className="w-full h-[600px] overflow-auto" // Using Tailwind for height and overflow
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {filteredCandidates.length === 0 ? (
              <div className="text-center p-8">
                No candidates found. Please refresh the page to load Mock
                candidates.
              </div>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const candidate = filteredCandidates[virtualItem.index];
                const style = {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                };
                return (
                  <CandidateCard
                    key={virtualItem.key}
                    candidate={candidate}
                    style={style}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal for creating a candidate */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Candidate"
      >
        <CandidateForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default CandidateList;
