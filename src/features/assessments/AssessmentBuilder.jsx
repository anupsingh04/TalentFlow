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
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Assessment Builder</h2>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saveMutation.isPending ? "Saving..." : "Save Assessment"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: The Builder */}
        <div className="flex-grow lg:w-3/5">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white p-4 rounded-lg shadow-md mb-6"
            >
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                placeholder="Section Title"
                className="text-2xl font-bold text-gray-800 border-none p-2 w-full focus:ring-2 focus:ring-indigo-200 rounded-md"
              />

              {section.questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  sectionId={section.id}
                  question={question}
                />
              ))}

              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center">
                  Add Question:
                </span>
                {QUESTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(section.id, type)}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={addSection}
            className="w-full text-center py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400"
          >
            + Add New Section
          </button>
        </div>

        {/* Right Column: The Live Preview */}
        <div className="lg:w-2/5">
          <div className="sticky top-8">
            <AssessmentPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilder;
