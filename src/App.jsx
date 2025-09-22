// src/App.jsx
import { Routes, Route } from "react-router-dom";
import JobsList from "./features/jobs/JobList";
import JobDetailPage from "./features/jobs/JobDetailPage";
import CandidateList from "./features/candidates/CandidateList";
import CandidateProfilePage from "./features/candidates/CandidateProfilePage";

function App() {
  return (
    <div>
      <h1>TALENTFLOW</h1>
      <Routes>
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route
          path="/candidates/:candidateId"
          element={<CandidateProfilePage />}
        />
      </Routes>
    </div>
  );
}

export default App;
