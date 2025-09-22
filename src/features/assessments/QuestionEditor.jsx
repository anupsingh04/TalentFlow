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
    <div
      style={{
        border: "1px dashed #ddd",
        padding: "12px",
        marginTop: "12px",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label style={{ fontWeight: "bold" }}>Question:</label>
        <button
          onClick={() => removeQuestion(sectionId, question.id)}
          style={{ color: "red" }}
        >
          Remove
        </button>
      </div>
      <textarea
        value={question.text}
        onChange={(e) =>
          updateQuestionText(sectionId, question.id, e.target.value)
        }
        placeholder={`Enter text for ${question.type} question...`}
        style={{ width: "100%", minHeight: "60px", marginTop: "8px" }}
      />

      {/* 2. Conditionally render the options UI */}
      {isChoiceBased && (
        <div style={{ marginTop: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Options:</label>
          {question.options.map((option, index) => (
            <div
              key={option.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
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
                style={{ width: "100%" }}
              />
              <button
                onClick={() => removeOption(sectionId, question.id, option.id)}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() => addOption(sectionId, question.id)}
            style={{ marginTop: "8px" }}
          >
            Add Option
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
