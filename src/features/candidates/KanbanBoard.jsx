// src/features/candidates/KanbanBoard.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import toast from "react-hot-toast";

const fetchAllCandidates = async () => {
  const response = await fetch("/candidates");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function KanbanColumn({ stage, candidates }) {
  return (
    // Column Styling
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-xl p-2 flex flex-col">
      <h3 className="font-semibold text-gray-700 px-2 py-1 capitalize">
        {stage}
        <span className="ml-2 text-sm font-normal text-gray-500">
          {candidates.length}
        </span>
      </h3>
      <SortableContext
        id={stage}
        items={candidates.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {/* Container for the cards with scrolling */}
        <div className="flex-grow min-h-0 overflow-y-auto p-1 space-y-2">
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
  const [searchTerm, setSearchTerm] = useState("");

  const queryKey = ["allCandidates"];
  const {
    data: candidates,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: fetchAllCandidates,
  });

  // This mutation now includes the full optimistic update logic
  const updateStageMutation = useMutation({
    mutationFn: ({ candidateId, newStage }) => {
      return fetch(`/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    },
    onMutate: async ({ candidateId, newStage }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCandidates = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return [];
        return oldData.map((c) =>
          c.id === candidateId ? { ...c, stage: newStage } : c
        );
      });

      return { previousCandidates };
    },
    onError: (err, variables, context) => {
      // Roll back the cache on error
      queryClient.setQueryData(queryKey, context.previousCandidates);
      // Add a toast to inform the user of the failure and rollback
      toast.error("Failed to update stage. Reverting change.");
    },
    onSuccess: () => {
      // Add a success toast
      toast.success("Candidate stage updated!");
    },
    onSettled: () => {
      // Always refetch to sync with the server
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // This useMemo hook now derives the displayed columns from the query data
  const columns = useMemo(() => {
    const filtered =
      candidates?.filter(
        (c) =>
          !searchTerm ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

    const grouped = {};
    STAGES.forEach((stage) => {
      grouped[stage] = filtered.filter((c) => c.stage === stage);
    });
    return grouped;
  }, [candidates, searchTerm]);

  function handleDragStart(event) {
    const candidate = candidates.find((c) => c.id === event.active.id);
    setActiveCandidate(candidate);
  }

  function handleDragEnd(event) {
    setActiveCandidate(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const activeContainer = active.data.current?.sortable.containerId;

    // This is the robust way to find the destination container (column)
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    updateStageMutation.mutate({
      candidateId: activeId,
      newStage: overContainer,
    });
  }

  if (isLoading) return <div>Loading board...</div>;
  if (isError) return <div>Error loading candidates.</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Hiring Pipeline</h2>
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3"
        />
      </div>

      {/* Main board container */}
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={columns[stage] || []}
            />
          ))}
        </div>

        {/* This renders the card being dragged so it appears "lifted" above the columns */}
        <DragOverlay>
          {activeCandidate ? (
            <div className="shadow-2xl rounded-md">
              <KanbanCard candidate={activeCandidate} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Don't forget to include the KanbanColumn component definition in this file.
// I have omitted it here for brevity.
export default KanbanBoard;
