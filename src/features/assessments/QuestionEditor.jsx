// src/features/assessments/QuestionEditor.jsx
import PropTypes from "prop-types";
import { useAssessmentStore } from "../../stores/assessmentStore";

function QuestionEditor({ sectionId, question }) {
  const {
    updateQuestionText,
    removeQuestion,
    addOption,
    updateOptionText,
    removeOption,
  } = useAssessmentStore();

  const isChoiceBased = ["single-choice", "multi-choice"].includes(
    question.type
  );

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 mt-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700 capitalize">
          {question.type} Question
        </label>
        <button
          onClick={() => removeQuestion(sectionId, question.id)}
          className="text-sm text-red-600 hover:text-red-800 font-semibold"
        >
          Remove
        </button>
      </div>
      <textarea
        value={question.text}
        onChange={(e) =>
          updateQuestionText(sectionId, question.id, e.target.value)
        }
        placeholder="Enter question text..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />

      {isChoiceBased && (
        <div className="mt-4 pl-2 border-l-2 border-gray-200">
          <label className="text-sm font-medium text-gray-600">Options:</label>
          {question.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  updateOptionText(
                    sectionId,
                    question.id,
                    option.id,
                    e.target.value
                  )
                }
                placeholder={`Option ${index + 1}`}
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                onClick={() => removeOption(sectionId, question.id, option.id)}
                className="text-gray-500 hover:text-red-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => addOption(sectionId, question.id)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            + Add Option
          </button>
        </div>
      )}
    </div>
  );
}

QuestionEditor.propTypes = {
  sectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  question: PropTypes.object.isRequired,
};

export default QuestionEditor;
