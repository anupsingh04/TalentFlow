// src/stores/assessmentStore.js
import { create } from "zustand";

export const useAssessmentStore = create((set) => ({
  // State
  jobId: null,
  sections: [],

  // Actions
  setInitialState: (initialState) => set(initialState),

  addSection: () =>
    set((state) => ({
      sections: [
        ...state.sections,
        // Add a new section with a unique temporary ID and a default title
        { id: `temp_${Date.now()}`, title: "New Section", questions: [] },
      ],
    })),

  updateSectionTitle: (sectionId, newTitle) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      ),
    })),

  // We will add more actions for questions later
}));
