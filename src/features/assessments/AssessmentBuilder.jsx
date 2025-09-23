// src/features/assessments/AssessmentBuilder.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAssessmentStore } from "../../stores/assessmentStore";
import QuestionEditor from "./QuestionEditor";
import AssessmentPreview from "./AssessmentPreview";
import styles from "./Assessment.module.css";

// Fetch function
const fetchAssessment = async (jobId) => {
  const response = await fetch(`/assessments/${jobId}`);
  if (!response.ok) throw new Error("Failed to fetch assessment");
  return response.json();
};
const QUESTION_TYPES = [
  "single-choice",
  "multi-choice",
  "short text",
  "long text",
];

function AssessmentBuilder() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();

  // Get state and actions from the Zustand store
  const {
    sections,
    setInitialState,
    addSection,
    updateSectionTitle,
    addQuestion,
  } = useAssessmentStore();

  // Fetch the initial assessment data from the API
  const { data: initialAssessment, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  // Load the fetched data into the store when the component mounts
  useEffect(() => {
    if (initialAssessment) {
      setInitialState(initialAssessment);
    }
  }, [initialAssessment, setInitialState]);

  // Create the mutation for saving the assessment
  const saveMutation = useMutation({
    mutationFn: (assessmentData) =>
      fetch(`/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
      }),
    onSuccess: () => {
      // Invalidate the query to ensure fresh data on next load
      queryClient.invalidateQueries({ queryKey: ["assessment", jobId] });
      alert("Assessment saved successfully!"); // Simple user feedback
    },
    onError: () => {
      alert("Error: Could not save assessment.");
    },
  });

  const handleSave = () => {
    // Get the current state directly from the store
    const currentState = useAssessmentStore.getState();
    const assessmentData = {
      sections: currentState.sections,
    };
    saveMutation.mutate(assessmentData);
  };

  if (isLoading) return <div>Loading assessment builder...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Assessment Builder for Job #{jobId}</h2>
        {/* Add the Save button */}
        <button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Assessment"}
        </button>
      </div>

      {/* New two-column layout */}
      <div
        style={{ display: "flex", gap: "20px", marginTop: "20px" }}
        className={styles.builderLayout}
      >
        {/* Left Column: The Builder */}
        <div style={{ flex: 1 }}>
          {sections.map((section) => (
            <div
              key={section.id}
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

              {/* 3. Render questions for this section */}
              {section.questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  sectionId={section.id}
                  question={question}
                />
              ))}

              {/* 4. Add controls to add new questions */}
              <div style={{ marginTop: "20px" }}>
                <span>Add Question:</span>
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(section.id, type)}
                    style={{ marginLeft: "10px" }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={addSection}>Add Section</button>
        </div>

        {/* Right Column: The Live Preview */}
        <div
          style={{
            flex: 1,
            position: "sticky",
            top: "20px",
            alignSelf: "flex-start",
          }}
        >
          <AssessmentPreview />
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilder;
