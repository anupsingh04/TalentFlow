// src/App.jsx
import { Routes, Route } from "react-router-dom";
import JobsList from "./features/jobs/JobList";
import JobDetailPage from "./features/jobs/JobDetailPage";
import CandidateList from "./features/candidates/CandidateList";
import CandidateProfilePage from "./features/candidates/CandidateProfilePage";
import KanbanBoard from "./features/candidates/KanbanBoard";
import AssessmentBuilder from "./features/assessments/AssessmentBuilder";

function App() {
  return (
    <div>
      <h1>TALENTFLOW</h1>
      <Routes>
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/jobs/:jobId/assessment" element={<AssessmentBuilder />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route
          path="/candidates/:candidateId"
          element={<CandidateProfilePage />}
        />
        <Route path="candidates/kanban" element={<KanbanBoard />} />
      </Routes>
    </div>
  );
}

export default App;
