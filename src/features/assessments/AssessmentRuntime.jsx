// src/features/assessments/AssessmentRuntime.jsx
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

// Fetch the assessment structure
const fetchAssessment = async (jobId) => {
  const response = await fetch(`/assessments/${jobId}`);
  if (!response.ok) throw new Error("Failed to fetch assessment");
  return response.json();
};

// Post the submission
const submitAssessment = async ({ jobId, data }) => {
  const response = await fetch(`/assessments/${jobId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to submit assessment");
  return response.json();
};

function AssessmentRuntime() {
  const { jobId } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Fetch the form structure
  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  // Mutation for submitting the form data
  const submissionMutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: () => {
      alert("Assessment submitted successfully!");
    },
    onError: () => {
      alert("Error: Could not submit assessment.");
    },
  });

  const onSubmit = (data) => {
    submissionMutation.mutate({ jobId, data });
  };

  // Watch the value of a specific question to use for conditional logic
  // NOTE: For this to work, a question must have a stable ID.
  // We'll assume the first question of the first section is the conditional trigger.
  //   const firstQuestionId = assessment?.sections[0]?.questions[0]?.id;
  //   const firstQuestionValue = watch(String(firstQuestionId));

  if (isLoading) return <div>Loading assessment...</div>;
  if (!assessment || assessment.sections.length === 0) {
    return <div>This job does not have an assessment.</div>;
  }

  return (
    <div>
      <h2>Assessment for Job #{jobId}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {assessment.sections.map((section) => (
          <div key={section.id} style={{ marginBottom: "20px" }}>
            {/* STYLING: Use h4 for section titles to match preview */}
            <h4>{section.title}</h4>
            {section.questions.map((question) => {
              const questionId = String(question.id); // Ensure ID is a string for RHF

              return (
                // STYLING: Add bottom margin to each question for spacing
                <div key={questionId} style={{ marginBottom: "15px" }}>
                  {/* STYLING: Make label a block element with margin */}
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    {question.text}
                  </label>

                  {question.type === "short text" && (
                    <input
                      {...register(questionId, { required: true })}
                      style={{ width: "100%" }}
                    />
                  )}
                  {question.type === "long text" && (
                    <textarea
                      {...register(questionId, { required: true })}
                      style={{ width: "100%" }}
                    />
                  )}
                  {question.type === "single-choice" && (
                    <div>
                      {question.options.map((opt) => (
                        <div key={opt.id}>
                          <input
                            {...register(questionId, { required: true })}
                            type="radio"
                            value={opt.text}
                          />{" "}
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* ADDED: Rendering logic for 'multi-choice' questions (checkboxes) */}
                  {question.type === "multi-choice" && (
                    <div>
                      {question.options.map((opt) => (
                        <div key={opt.id}>
                          <input
                            {...register(`${questionId}.${opt.id}`)} // Use unique names for checkboxes
                            type="checkbox"
                            value={opt.text}
                          />{" "}
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {errors[questionId] && (
                    <p style={{ color: "red" }}>This field is required</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <button type="submit" disabled={submissionMutation.isPending}>
          {submissionMutation.isPending ? "Submitting..." : "Submit Assessment"}
        </button>
      </form>
    </div>
  );
}

export default AssessmentRuntime;
