// src/features/candidates/CandidateProfilePage.jsx
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import toast from "react-hot-toast";

// This is our local list of users for @mention suggestions
const users = [
  { id: "sarah.day", display: "Sarah Day" },
  { id: "john.doe", display: "John Doe" },
  { id: "jane.smith", display: "Jane Smith" },
  { id: "kevin.jones", display: "Kevin Jones" },
];

// Fetch functions
const fetchCandidateById = async (candidateId) => {
  const response = await fetch(`/candidates/${candidateId}`);
  if (!response.ok) throw new Error("Candidate not found");
  return response.json();
};

const fetchCandidateTimeline = async (candidateId) => {
  const response = await fetch(`/candidates/${candidateId}/timeline`);
  if (!response.ok) throw new Error("Timeline not found");
  return response.json();
};

// New fetch and post functions for notes
const fetchNotes = async (candidateId) => {
  const response = await fetch(`/candidates/${candidateId}/notes`);
  if (!response.ok) throw new Error("Could not fetch notes");
  return response.json();
};

const postNote = async ({ candidateId, content }) => {
  const response = await fetch(`/candidates/${candidateId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Could not save note");
  return response.json();
};

// This new version correctly parses the markup from react-mentions
function NoteContent({ content }) {
  // Regex to find all instances of the markup, e.g., @[display](id)
  const mentionRegex = /(@\[([^\]]+)\]\(([^)]+)\))/g;

  // Split the content by the mention regex
  const parts = content.split(mentionRegex);

  return (
    <p>
      {parts.map((part, i) => {
        // The regex split gives us the full markup, the display name, and the id.
        // We check if the current part is a display name by looking at the previous part.
        const isDisplayName = i > 0 && parts[i - 1]?.match(mentionRegex);

        if (isDisplayName) {
          // If it's a display name, render it in bold with an @ sign
          return <strong key={i}>@{part}</strong>;
        }

        // Ignore the full markup and the id parts
        if (
          part.match(mentionRegex) ||
          (i > 1 && parts[i - 2]?.match(mentionRegex))
        ) {
          return null;
        }

        // Otherwise, render the plain text part
        return part;
      })}
    </p>
  );
}

function CandidateProfilePage() {
  const { candidateId } = useParams();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");

  // Fetch candidate details
  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchCandidateById(candidateId),
  });

  // Fetch candidate timeline
  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["candidateTimeline", candidateId],
    queryFn: () => fetchCandidateTimeline(candidateId),
  });

  // Query for fetching notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes", candidateId],
    queryFn: () => fetchNotes(candidateId),
  });

  // Mutation for posting a new note
  const addNoteMutation = useMutation({
    mutationFn: postNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", candidateId] });
      setNoteContent(""); // Clear the textarea
      toast.success("Note added successfully!");
    },
    onError: () => {
      toast.error("Error: Could not save note.");
    },
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (noteContent.trim()) {
      addNoteMutation.mutate({ candidateId, content: noteContent });
    }
  };

  const isLoading = isLoadingCandidate || isLoadingTimeline || isLoadingNotes;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4">
        <Link to="/candidates" className="text-blue-600 hover:underline">
          &larr; Back to Candidate List
        </Link>
      </div>

      {isLoading ? (
        <div>Loading profile...</div>
      ) : candidate ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">{candidate.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Email: {candidate.email}</p>
          <p className="mt-1 text-sm text-gray-500">
            Current Stage:{" "}
            <span className="font-semibold capitalize">{candidate.stage}</span>
          </p>

          <hr className="my-6" />

          {/* Notes Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Notes</h2>
            <form onSubmit={handleAddNote} className="flex flex-col gap-2">
              <MentionsInput
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note... use @ to mention a user."
                className="mentions-input" // This class is for your global CSS
                disabled={addNoteMutation.isPending}
              >
                {/* This child component was missing */}
                <Mention
                  trigger="@"
                  data={users}
                  markup="@[__display__](__id__)"
                  displayTransform={(id, display) => `@${display}`}
                />
              </MentionsInput>

              <button
                type="submit"
                disabled={addNoteMutation.isPending}
                className="self-start inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {addNoteMutation.isPending ? "Saving..." : "Save Note"}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {notes?.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 rounded-md border border-gray-200"
                >
                  <NoteContent content={note.content} />
                  <small className="text-gray-500">
                    Posted on {new Date(note.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-6" />

          {/* Timeline Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Activity Timeline
            </h2>
            {timeline?.length > 0 ? (
              <ul className="space-y-4">
                {timeline.map((event) => (
                  <li key={event.id} className="flex gap-4">
                    <div className="text-right text-sm text-gray-500 w-32 flex-shrink-0">
                      {new Date(event.date).toLocaleString()}
                    </div>
                    <div className="relative pl-4">
                      <div className="absolute top-2 left-[-6.5px] h-3 w-3 bg-gray-300 rounded-full border-2 border-white"></div>
                      <div className="absolute top-2 left-[-1px] h-full w-0.5 bg-gray-200"></div>
                      <p className="relative">{event.event}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No timeline events found.</p>
            )}
          </div>
        </div>
      ) : (
        <h2>Candidate not found.</h2>
      )}
    </div>
  );
}

export default CandidateProfilePage;
