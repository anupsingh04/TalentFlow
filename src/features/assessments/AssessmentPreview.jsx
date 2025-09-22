// src/features/assessments/AssessmentPreview.jsx
import { useAssessmentStore } from "../../stores/assessmentStore";

function AssessmentPreview() {
  // The preview directly reflects the state in the builder
  const { sections } = useAssessmentStore();

  return (
    <div
      style={{ padding: "16px", border: "1px solid #007bff", height: "100%" }}
    >
      <h3 style={{ marginTop: 0, color: "#007bff" }}>Live Preview</h3>
      {sections.length === 0 && <p>Add a section to begin.</p>}

      {sections.map((section) => (
        <div key={section.id} style={{ marginBottom: "20px" }}>
          <h4>{section.title || "[Section Title]"}</h4>
          {section.questions.map((question) => (
            <div key={question.id} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                {question.text || "[Question Text]"}
              </label>
              {["short text", "long text"].includes(question.type) && (
                <input type="text" style={{ width: "100%" }} disabled />
              )}
              {question.type === "single-choice" &&
                question.options.map((opt) => (
                  <div key={opt.id}>
                    <input type="radio" name={question.id} disabled />{" "}
                    {opt.text || "[Option]"}
                  </div>
                ))}
              {question.type === "multi-choice" &&
                question.options.map((opt) => (
                  <div key={opt.id}>
                    <input type="checkbox" disabled /> {opt.text || "[Option]"}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AssessmentPreview;
