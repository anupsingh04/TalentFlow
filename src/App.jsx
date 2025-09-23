// src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import JobsList from "./features/jobs/JobList";
import JobDetailPage from "./features/jobs/JobDetailPage";
import CandidateList from "./features/candidates/CandidateList";
import CandidateProfilePage from "./features/candidates/CandidateProfilePage";
import KanbanBoard from "./features/candidates/KanbanBoard";
import AssessmentBuilder from "./features/assessments/AssessmentBuilder";
import AssessmentRuntime from "./features/assessments/AssessmentRuntime";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    // Use a CSS fragment to apply a base background color
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-center" />

      {/* Main Navigation Bar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex gap-8 items-center">
          <h1 className="text-xl font-bold text-blue-600">TalentFlow</h1>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Jobs
          </NavLink>
          <NavLink
            to="/candidates"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Candidates
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* New landing page */}
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/kanban" element={<KanbanBoard />} />
          <Route
            path="/candidates/:candidateId"
            element={<CandidateProfilePage />}
          />
          <Route
            path="/jobs/:jobId/assessment"
            element={<AssessmentBuilder />}
          />
          <Route path="/assessment/:jobId" element={<AssessmentRuntime />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
