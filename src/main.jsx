import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { seedInitialData } from "./api/seed"; // Import the seeder
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Create a client
const queryClient = new QueryClient();

//this function starts the mock service worker
async function enableMocking() {
  //we want to enable mocking only in development
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  // Seed the database before starting the worker
  await seedInitialData();
  const { worker } = await import("./mocks/browser");
  // Start the worker. 'onUnhandledRequest: 'bypass'' means if a request
  // is not handled by our mock handlers, it will be performed as-is.
  return worker.start({ onUnhandledRequest: "bypass" });
}

//We call enable mocking and then render the app
enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
});
