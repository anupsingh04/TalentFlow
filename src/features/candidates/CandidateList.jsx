// src/features/candidates/CandidateList.jsx
import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import CandidateCard from "./CandidateCard";
import styles from "./CandidateCard.module.css";
import { Link } from "react-router-dom";

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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Candidates</h2>
        <Link
          to="/kanban"
          style={
            {
              /* ... some styling ... */
            }
          }
        >
          View Kanban Board
        </Link>
      </div>

      {/* Filter and Search UI */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "250px", padding: "8px" }}
        />
        <div>
          {/* Use a label for better accessibility */}
          <label htmlFor="stage-filter" style={{ marginRight: "5px" }}>
            Filter by stage:
          </label>
          <select
            id="stage-filter"
            onChange={(e) => handleStageChange(e.target.value)}
            value={stage}
            style={{ padding: "8px" }}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Handle Loading, Error, and Empty states before rendering the list */}
      {isLoading ? (
        <div>Loading candidates...</div>
      ) : isError ? (
        <div>Error loading candidates. Please try again.</div>
      ) : filteredCandidates.length === 0 ? (
        <div>No candidates found.</div>
      ) : (
        /* The Scrolling Container - only rendered when there is data */
        <div
          ref={parentRef}
          style={{
            height: `600px`,
            width: `100%`,
            overflow: "auto",
            border: "1px solid #ccc",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateList;
