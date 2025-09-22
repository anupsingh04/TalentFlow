// src/stores/assessmentStore.js
import { create } from "zustand";
import { produce } from "immer"; // Immer helps with complex state updates

export const useAssessmentStore = create((set) => ({
  // State
  jobId: null,
  sections: [],

  // Actions
  setInitialState: (initialState) => set(initialState),

  addSection: () =>
    set(
      produce((draft) => {
        draft.sections.push({
          id: `temp_${Date.now()}`,
          title: "New Section",
          questions: [],
        });
      })
    ),

  updateSectionTitle: (sectionId, newTitle) =>
    set(
      produce((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (section) section.title = newTitle;
      })
    ),

  // --- NEW ACTIONS FOR QUESTIONS ---
  addQuestion: (sectionId, questionType) =>
    set(
      produce((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (section) {
          section.questions.push({
            id: `temp_q_${Date.now()}`,
            type: questionType,
            text: "",
            options: [], // For choice-based questions
          });
        }
      })
    ),

  updateQuestionText: (sectionId, questionId, text) =>
    set(
      produce((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        const question = section?.questions.find((q) => q.id === questionId);
        if (question) question.text = text;
      })
    ),

  removeQuestion: (sectionId, questionId) =>
    set(
      produce((draft) => {
        const section = draft.sections.find((s) => s.id === sectionId);
        if (section) {
          section.questions = section.questions.filter(
            (q) => q.id !== questionId
          );
        }
      })
    ),

  // --- NEW ACTIONS FOR OPTIONS ---
  addOption: (sectionId, questionId) =>
    set(
      produce((draft) => {
        const question = draft.sections
          .find((s) => s.id === sectionId)
          ?.questions.find((q) => q.id === questionId);

        if (question) {
          question.options.push({ id: `temp_opt_${Date.now()}`, text: "" });
        }
      })
    ),

  updateOptionText: (sectionId, questionId, optionId, text) =>
    set(
      produce((draft) => {
        const option = draft.sections
          .find((s) => s.id === sectionId)
          ?.questions.find((q) => q.id === questionId)
          ?.options.find((o) => o.id === optionId);

        if (option) option.text = text;
      })
    ),

  removeOption: (sectionId, questionId, optionId) =>
    set(
      produce((draft) => {
        const question = draft.sections
          .find((s) => s.id === sectionId)
          ?.questions.find((q) => q.id === questionId);

        if (question) {
          question.options = question.options.filter((o) => o.id !== optionId);
        }
      })
    ),
}));
