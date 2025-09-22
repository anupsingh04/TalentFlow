// src/features/candidates/KanbanBoard.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

// Fetch ALL candidates. No filters needed for the board view.
const fetchAllCandidates = async () => {
  const response = await fetch("/candidates");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

// A separate component for the column to keep things clean
function KanbanColumn({ stage, candidates }) {
  return (
    <div
      style={{
        flex: "0 0 300px",
        backgroundColor: "#f4f5f7",
        borderRadius: "8px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ padding: "0 8px", textTransform: "capitalize" }}>
        {stage} ({candidates.length})
      </h3>
      <SortableContext
        id={stage}
        items={candidates.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          {candidates.map((candidate) => (
            <KanbanCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanBoard() {
  const queryClient = useQueryClient();
  const [activeCandidate, setActiveCandidate] = useState(null);

  const {
    data: candidates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allCandidates"], // A new query key for all candidates
    queryFn: fetchAllCandidates,
  });

  // 1. Create the mutation to update a candidate's stage
  const updateStageMutation = useMutation({
    mutationFn: ({ candidateId, newStage }) => {
      return fetch(`/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    },
    // When the mutation succeeds, refetch the data to ensure consistency
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCandidates"] });
    },
  });

  // 2. Group candidates into columns. We'll use a state variable to manage this optimistically.
  const [columns, setColumns] = useState({});
  useEffect(() => {
    if (candidates) {
      const grouped = {};
      STAGES.forEach((stage) => {
        grouped[stage] = candidates.filter((c) => c.stage === stage);
      });
      setColumns(grouped);
    }
  }, [candidates]);

  // 3. Handle the drag-and-drop events
  function handleDragStart(event) {
    const candidate = candidates.find((c) => c.id === event.active.id);
    setActiveCandidate(candidate);
  }

  function handleDragEnd(event) {
    setActiveCandidate(null);
    const { active, over } = event;

    if (!over) return; // Dropped outside a column

    const activeId = active.id;
    const overId = over.id;

    // Find the columns
    const activeContainer = active.data.current.sortable.containerId;
    let overContainer = over.data.current?.sortable.containerId;

    if (!overContainer) {
      // If dropping on a card, find its container
      const candidate = candidates.find((c) => c.id === overId);
      if (candidate) overContainer = candidate.stage;
    }

    if (!overContainer || activeContainer === overContainer) {
      return; // No change in column
    }

    // Optimistic Update
    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const activeItem = activeItems[activeIndex];

      // Update the stage of the moved item
      activeItem.stage = overContainer;

      return {
        ...prev,
        [activeContainer]: [
          ...activeItems.slice(0, activeIndex),
          ...activeItems.slice(activeIndex + 1),
        ],
        [overContainer]: [...overItems, activeItem],
      };
    });

    // Trigger the mutation to update the backend
    updateStageMutation.mutate({
      candidateId: activeId,
      newStage: overContainer,
    });
  }

  if (isLoading) return <div>Loading board...</div>;
  if (isError) return <div>Error loading candidates.</div>;

  return (
    <div>
      <h2>Hiring Pipeline</h2>
      {/* 4. Wrap the board in the DndContext */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "16px",
            overflowX: "auto",
            padding: "10px",
            height: "calc(100vh - 150px)",
          }}
        >
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={columns[stage] || []}
            />
          ))}
        </div>

        {/* DragOverlay makes the card look nice while dragging */}
        <DragOverlay>
          {activeCandidate ? <KanbanCard candidate={activeCandidate} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
