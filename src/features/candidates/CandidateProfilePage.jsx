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
    <div>
      <Link to="/candidates">&larr; Back to Candidate List</Link>
      {isLoading ? (
        <div>Loading profile...</div>
      ) : candidate ? (
        <div>
          <h1 style={{ marginTop: "20px" }}>{candidate.name}</h1>
          <p>Email: {candidate.email}</p>
          <p>Current Stage: {candidate.stage}</p>

          <hr />

          {/* Add the "Add Note" form */}
          <h2>Notes</h2>
          <form onSubmit={handleAddNote}>
            {/* 2. Replace the textarea with the MentionsInput component */}
            <MentionsInput
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note... use @ to mention a user."
              style={{ width: "100%", minHeight: "80px" }}
              disabled={addNoteMutation.isPending}
            >
              <Mention
                trigger="@"
                data={users}
                // Explicitly define how the final text should be marked up.
                // This stores both the display name and the ID.
                markup="@[__display__](__id__)"
                // Explicitly tell the component what to show in the input field.
                displayTransform={(id, display) => `@${display}`}
              />
            </MentionsInput>

            <button
              type="submit"
              disabled={addNoteMutation.isPending}
              style={{ marginTop: "10px" }}
            >
              {addNoteMutation.isPending ? "Saving..." : "Save Note"}
            </button>
          </form>

          {/* Display the list of notes */}
          <div style={{ marginTop: "20px" }}>
            {notes?.map((note) => (
              <div
                key={note.id}
                style={{
                  border: "1px solid #eee",
                  padding: "10px",
                  borderRadius: "4px",
                  marginBottom: "10px",
                }}
              >
                <NoteContent content={note.content} />
                <small style={{ color: "#777" }}>
                  Posted on {new Date(note.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>

          <hr />

          <h2>Activity Timeline</h2>
          {timeline?.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {timeline.map((event) => (
                <li
                  key={event.id}
                  style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}
                >
                  <strong>{event.date}:</strong> {event.event}
                </li>
              ))}
            </ul>
          ) : (
            <p>No timeline events found.</p>
          )}
        </div>
      ) : (
        <h2>Candidate not found.</h2>
      )}
    </div>
  );
}

export default CandidateProfilePage;
