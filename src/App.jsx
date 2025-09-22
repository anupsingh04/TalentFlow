// src/App.jsx
import { Routes, Route } from "react-router-dom";
import JobsList from "./features/jobs/JobList";
import JobDetailPage from "./features/jobs/JobDetailPage"; // 1. Import the new component

function App() {
  return (
    <div>
      <h1>TALENTFLOW</h1>
      <Routes>
        <Route path="/" element={<JobsList />} />
        {/* 2. Add the new route for the detail page */}
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
