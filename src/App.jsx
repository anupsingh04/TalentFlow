// src/App.jsx
import { Routes, Route, NavLink, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import JobsList from "./features/jobs/JobList";
import JobDetailPage from "./features/jobs/JobDetailPage";
import CandidateList from "./features/candidates/CandidateList";
import CandidateProfilePage from "./features/candidates/CandidateProfilePage";
import KanbanBoard from "./features/candidates/KanbanBoard";
import AssessmentBuilder from "./features/assessments/AssessmentBuilder";
import AssessmentRuntime from "./features/assessments/AssessmentRuntime";
import Dashboard from "./pages/Dashboard";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";

function App() {
  return (
    // Use a CSS fragment to apply a base background color
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-center" />

      {/* Main Navigation Bar */}
      {/* --- Updated Navigation Bar --- */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex gap-6 items-center">
          <Link to="/" className="no-underline">
            <h1 className="text-2xl font-bold text-blue-600">TalentFlow</h1>
          </Link>

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
        <ErrorBoundary FallbackComponent={ErrorFallback}>
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
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
