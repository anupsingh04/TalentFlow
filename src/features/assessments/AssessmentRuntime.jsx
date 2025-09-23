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
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {isLoading ? (
        <div className="text-center">Loading assessment...</div>
      ) : !assessment || assessment.sections.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          This job does not have an assessment.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Assessment for Job #{jobId}
            </h2>
            <p className="text-gray-600 mb-6">
              Please complete all the required fields.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              {assessment.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 pb-2 mb-4 border-b border-gray-200">
                    {section.title}
                  </h3>
                  <div className="space-y-6">
                    {section.questions.map((question) => {
                      const questionId = String(question.id);
                      return (
                        <div key={questionId}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {question.text}
                          </label>

                          {question.type === "short text" && (
                            <input
                              {...register(questionId, { required: true })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          )}
                          {question.type === "long text" && (
                            <textarea
                              {...register(questionId, { required: true })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              rows={4}
                            />
                          )}
                          {question.type === "single-choice" && (
                            <div className="space-y-2 mt-2">
                              {question.options.map((opt) => (
                                <div key={opt.id} className="flex items-center">
                                  <input
                                    id={`${questionId}-${opt.id}`}
                                    {...register(questionId, {
                                      required: true,
                                    })}
                                    type="radio"
                                    value={opt.text}
                                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label
                                    htmlFor={`${questionId}-${opt.id}`}
                                    className="ml-3 block text-sm text-gray-700"
                                  >
                                    {opt.text}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === "multi-choice" && (
                            <div className="space-y-2 mt-2">
                              {question.options.map((opt) => (
                                <div key={opt.id} className="flex items-center">
                                  <input
                                    id={`${questionId}-${opt.id}`}
                                    {...register(`${questionId}.${opt.id}`)}
                                    type="checkbox"
                                    value={opt.text}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label
                                    htmlFor={`${questionId}-${opt.id}`}
                                    className="ml-3 block text-sm text-gray-700"
                                  >
                                    {opt.text}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          {errors[questionId] && (
                            <p className="mt-1 text-sm text-red-600">
                              This field is required
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submissionMutation.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                  {submissionMutation.isPending
                    ? "Submitting..."
                    : "Submit Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentRuntime;
