# TalentFlow - A Mini Hiring Platform

A comprehensive front-end application built with React that simulates a modern hiring platform. This project allows an HR team to manage job postings, track candidates through a drag-and-drop Kanban board, and build dynamic, job-specific assessments.

**Note:** This is a front-end-only application with no backend server. All data is persisted locally in the browser's IndexedDB, and the API is simulated using Mock Service Worker (MSW).

---

## Live Demo

**[Live demo coming soon (to be deployed on Vercel/Netlify).]**

---

## Features

### Job Management

- **Jobs Board:** A paginated and filterable list of all job postings.
- **CRUD Operations:** Create, edit, archive, and unarchive jobs through a styled modal form.
- **Drag-and-Drop Reordering:** Optimistically reorder jobs on the board with rollback on failure.
- **Deep Linking:** Navigate directly to a job's detail page, which lists all associated candidates.

### Candidate Management

- **Virtualized List:** Efficiently displays and searches a list of 1,000+ candidates without performance issues.
- **Kanban Board:** A fully interactive, drag-and-drop board to move candidates between hiring stages (`applied`, `screen`, `tech`, etc.).
- **Dynamic Timelines:** Candidate profiles display a real-time timeline of all their stage changes.
- **Notes with @mentions:** Add notes to a candidate's profile with a rich text input that suggests users from a local list.

### Assessment Engine

- **Dynamic Assessment Builder:** Create custom forms for any job, adding sections and questions of various types (short text, single-choice, multi-choice).
- **Live Preview:** See a real-time preview of the assessment as it's being built.
- **Form Runtime:** A fully functional, candidate-facing form with validation and conditional logic.

---

## Tech Stack

- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS
- **API Simulation:** Mock Service Worker (MSW)
- **Local Database:** Dexie.js (a wrapper for IndexedDB)
- **Server State & Caching:** TanStack Query (React Query)
- **Client State:** Zustand (for the Assessment Builder)
- **Routing:** React Router
- **Forms:** React Hook Form with Yup for validation
- **Drag & Drop:** @dnd-kit
- **List Virtualization:** TanStack Virtual
- **Notifications:** React Hot Toast

---

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/anupsingh04/TalentFlow.git
    cd TalentFlow
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Architecture & Technical Decisions

This project follows a feature-sliced architecture where UI components, hooks, and pages are co-located within feature directories (e.g., `/src/features/jobs`, `/src/features/candidates`).

- **API & Data Layer:** The application is architected to be completely client-side. **MSW** intercepts network requests to simulate a REST API, while **Dexie.js** provides a robust wrapper around IndexedDB for all data persistence. This setup allows for realistic testing of loading, error, and caching states without a real backend.
- **State Management:** State is divided into two categories:
  - **Server State:** Managed by **TanStack Query**. This handles all asynchronous operations like fetching, caching, and updating data, providing features like optimistic updates and query invalidation out of the box.
  - **Client State:** For complex, synchronous UI state, **Zustand** was chosen for its simplicity and minimal boilerplate. It is used exclusively for the intricate state of the Assessment Builder.
- **UI & Forms:** **Tailwind CSS** was chosen for its utility-first approach, allowing for rapid development of custom, modern designs. **React Hook Form** is used for all forms to ensure optimal performance by minimizing re-renders.

---

## Known Issues & Trade-offs

- The application is front-end only. All data is stored in the browser and will be lost if the browser's application data is cleared.
- The `@mention` suggestion feature uses a simple, hardcoded list of users.
- The timeline generation is based on stage changes but could be expanded to include other event types.
- Kanban Board State Conflict: A state management conflict currently exists between the client-side search filter and the optimistic UI updates for drag-and-drop. As a result, changing a candidate's stage via drag-and-drop does not persist correctly when the list of candidates is actively filtered. This functionality works as expected when no search filter is applied.
