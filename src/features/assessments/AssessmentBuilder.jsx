// src/features/assessments/AssessmentBuilder.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAssessmentStore } from "../../stores/assessmentStore";

// Fetch function
const fetchAssessment = async (jobId) => {
  const response = await fetch(`/assessments/${jobId}`);
  if (!response.ok) throw new Error("Failed to fetch assessment");
  return response.json();
};

function AssessmentBuilder() {
  const { jobId } = useParams();

  // 1. Get state and actions from the Zustand store
  const { sections, setInitialState, addSection, updateSectionTitle } =
    useAssessmentStore();

  // 2. Fetch the initial assessment data from the API
  const { data: initialAssessment, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  // 3. Load the fetched data into the store when the component mounts
  useEffect(() => {
    if (initialAssessment) {
      setInitialState(initialAssessment);
    }
  }, [initialAssessment, setInitialState]);

  if (isLoading) return <div>Loading assessment builder...</div>;

  return (
    <div>
      <h2>Assessment Builder for Job #{jobId}</h2>

      {sections.map((section, index) => (
        <div
          key={section.id || index}
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            margin: "16px 0",
          }}
        >
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            style={{
              fontSize: "1.5em",
              border: "none",
              width: "100%",
              marginBottom: "10px",
            }}
          />
          {/* We will render questions here later */}
        </div>
      ))}

      <button onClick={addSection}>Add Section</button>
      {/* We will add a save button later */}
    </div>
  );
}

export default AssessmentBuilder;
