// src/features/candidates/CandidateProfilePage.jsx
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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

function CandidateProfilePage() {
  const { candidateId } = useParams();

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

  const isLoading = isLoadingCandidate || isLoadingTimeline;

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
