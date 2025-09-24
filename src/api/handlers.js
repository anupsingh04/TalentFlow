import { http, HttpResponse } from "msw";
import { db } from "./db";

//Helper function for reordering jobs "PATCH /jobs/:id/reorder" request
function arrayMove(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
  return arr;
}

export const handlers = [
  //Add API handlers here

  // <----- JOB HANDLERS START  ----->
  //Handles a GET /jobs request
  http.get("/jobs", async ({ request }) => {
    // --- ADD DELAY ---
    // This will pause execution for 0.2s - 1.2s to simulate a network request
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 1000));
    // --- END DELAY ---

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const tag = url.searchParams.get("tag");
    // --- Start of new pagination logic ---
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = 10; // Let's set a page size of 10
    // --- End of new pagination logic ---

    let jobsCollection = db.jobs;

    //Apply status filter if it exists
    if (status && status !== "all") {
      jobsCollection = jobsCollection.where("status").equals(status);
    }

    // First, get the results from the initial query
    let partlyFilteredJobs = await jobsCollection.toArray();

    // Now, apply the second filter (for tags) using JavaScript's .filter()
    let fullyFilteredJobs = tag
      ? partlyFilteredJobs.filter((job) => job.tags.includes(tag))
      : partlyFilteredJobs;

    // The rest of the logic remains the same, but operates on the correctly filtered array
    fullyFilteredJobs.sort((a, b) => a.order - b.order);

    const finalFilteredJobs = search
      ? fullyFilteredJobs.filter((job) =>
          job.title.toLowerCase().includes(search.toLowerCase())
        )
      : fullyFilteredJobs;

    const totalCount = finalFilteredJobs.length;
    const paginatedJobs = finalFilteredJobs.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    // Return a new object shape with the jobs and the total count
    return HttpResponse.json({
      jobs: paginatedJobs,
      totalCount: totalCount,
    });
    // --- End of updated response logic ---
  }),

  //Handles POST /jobs request (Create job)
  http.post("/jobs", async ({ request }) => {
    // --- ADD DELAY ---
    // This will pause execution for 0.2s - 1.2s to simulate a network request
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 1000));
    // --- END DELAY ---

    const newJobData = await request.json();

    // Get the current number of jobs to determine the new order
    const jobCount = await db.jobs.count();

    const newJob = {
      status: "active",
      ...newJobData,
      slug: newJobData.title.toLowerCase().replace(/\s+/g, "-"),
      order: jobCount + 1, // Add the order property
    };

    try {
      const id = await db.jobs.add(newJob);
      return HttpResponse.json({ ...newJob, id }, { status: 201 });
    } catch (error) {
      console.error("Failed to add job to DB:", error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  //Handles PATCH /jobs/:id request (Update job)
  http.patch("/jobs/:id", async ({ request, params }) => {
    // --- ADD DELAY ---
    // This will pause execution for 0.2s - 1.2s to simulate a network request
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 1000));
    // --- END DELAY ---

    const { id } = params;
    const updates = await request.json();

    //update in the database
    await db.jobs.update(Number(id), updates);

    return HttpResponse.json(updates);
  }),

  // Handles GET /jobs/:id request (Fetch single job)
  http.get("/jobs/:id", async ({ params }) => {
    const { id } = params;

    // Dexie's get() is highly efficient for fetching by primary key
    const job = await db.jobs.get(Number(id));

    if (job) {
      return HttpResponse.json(job);
    }
    // Return a 404 if the job is not found
    return new HttpResponse(null, { status: 404 });
  }),

  // NEW - Handles PATCH /jobs/:id/reorder request
  http.patch("/jobs/:id/reorder", async ({ request }) => {
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 800));

    // Simulate failure rate
    if (Math.random() < 0.25) {
      console.error("💥 Simulated API Error: Failed to reorder job.");
      return new HttpResponse(JSON.stringify({ message: "Server error" }), {
        status: 500,
      });
    }

    const { activeId, overId } = await request.json();

    try {
      // 1. Fetch all jobs, sorted by their current order
      const allJobs = await db.jobs.orderBy("order").toArray();

      // 2. Find the current indexes of the dragged and target items
      const fromIndex = allJobs.findIndex((job) => job.id === activeId);
      const toIndex = allJobs.findIndex((job) => job.id === overId);

      if (fromIndex === -1 || toIndex === -1) {
        throw new Error("Job not found for reordering");
      }

      // 3. Reorder the array in memory
      const reorderedJobs = arrayMove([...allJobs], fromIndex, toIndex);

      // 4. Create an array of updated jobs with new 'order' properties
      const updates = reorderedJobs.map((job, index) => ({
        ...job,
        order: index + 1, // Re-assign order based on new array position
      }));

      // 5. Use bulkPut to efficiently update all changed jobs in Dexie
      await db.jobs.bulkPut(updates);

      console.log("✅ API Success: Job order persisted in the database.");
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error("Error processing reorder in API:", error);
      return new HttpResponse(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500 }
      );
    }
  }),

  // Handles GET /jobs/:jobId/candidates
  http.get("/jobs/:jobId/candidates", async ({ params }) => {
    const jobId = Number(params.jobId);
    const candidates = await db.candidates.where({ jobId }).toArray();
    return HttpResponse.json(candidates);
  }),
  // <----- JOB HANDLERS END  ----->

  // <----- CANDIDATE HANDLERS START  ----->
  // Handles GET /candidates request
  http.get("/candidates", async ({ request }) => {
    // --- ADD DELAY ---
    // This will pause execution for 0.2s - 1.2s to simulate a network request
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 1000));
    // --- END DELAY ---

    const url = new URL(request.url);
    const stage = url.searchParams.get("stage");
    const search = url.searchParams.get("search");

    let candidatesCollection = db.candidates;

    // Use the index for efficient filtering by stage
    if (stage && stage !== "all") {
      candidatesCollection = candidatesCollection.where("stage").equals(stage);
    }

    let candidates = await candidatesCollection.toArray();

    // The spec calls for client-side search, but we can support a basic server search too
    if (search) {
      const searchTerm = search.toLowerCase();
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm) ||
          c.email.toLowerCase().includes(searchTerm)
      );
    }

    return HttpResponse.json(candidates);
  }),

  // Handles GET /candidates/:id (Fetch single candidate)
  http.get("/candidates/:id", async ({ params }) => {
    const { id } = params;
    const candidate = await db.candidates.get(Number(id));

    if (candidate) {
      return HttpResponse.json(candidate);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Handles GET /candidates/:id/timeline (Fetch candidate activity)
  http.get("/candidates/:id/timeline", async ({ params }) => {
    const candidateId = Number(params.id);
    // Fetch real timeline events from the database for this candidate
    const events = await db.timelineEvents.where({ candidateId }).toArray();

    // You can also add notes to the timeline for a richer history
    const notes = await db.notes.where({ candidateId }).toArray();

    const combinedTimeline = [
      ...events.map((e) => ({
        id: `evt-${e.id}`,
        date: e.timestamp,
        event: e.eventText,
      })),
      ...notes.map((n) => ({
        id: `note-${n.id}`,
        date: n.createdAt,
        event: `Note added: "${n.content}"`,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first

    return HttpResponse.json(combinedTimeline);
  }),

  // Handles POST /candidates (Create new candidate)
  http.post("/candidates", async ({ request }) => {
    const newCandidateData = await request.json();

    const newCandidate = {
      ...newCandidateData,
      stage: "applied", // New candidates always start in the 'applied' stage
    };

    try {
      const id = await db.candidates.add(newCandidate);
      return HttpResponse.json({ ...newCandidate, id }, { status: 201 });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ message: "Failed to create candidate" }),
        { status: 500 }
      );
    }
  }),

  // Handles PATCH /candidates/:id (for updating stage)
  http.patch("/candidates/:id", async ({ request, params }) => {
    const id = Number(params.id);
    const { stage: newStage } = await request.json();

    if (!newStage) {
      return new HttpResponse(
        JSON.stringify({ message: "Stage is required" }),
        { status: 400 }
      );
    }

    try {
      // Get the candidate's current state before updating
      const oldCandidate = await db.candidates.get(id);

      // Update the candidate's stage
      await db.candidates.update(id, { stage: newStage });

      // Create a new timeline event for the stage change
      await db.timelineEvents.add({
        candidateId: id,
        timestamp: new Date().toISOString(),
        eventText: `Moved from '${oldCandidate.stage}' to '${newStage}' stage.`,
      });

      const updatedCandidate = await db.candidates.get(id);
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ message: "Failed to update candidate" }),
        { status: 500 }
      );
    }
  }),

  // Handles GET /candidates/:id/notes
  http.get("/candidates/:id/notes", async ({ params }) => {
    const candidateId = Number(params.id);
    // Use .where() to find all notes for a specific candidate
    const notes = await db.notes.where({ candidateId }).toArray();
    return HttpResponse.json(notes.reverse()); // Show newest first
  }),

  // Handles POST /candidates/:id/notes
  http.post("/candidates/:id/notes", async ({ request, params }) => {
    const candidateId = Number(params.id);
    const { content } = await request.json();

    const newNote = {
      candidateId,
      content,
      createdAt: new Date().toISOString(),
    };

    const id = await db.notes.add(newNote);
    return HttpResponse.json({ ...newNote, id }, { status: 201 });
  }),
  // <----- CANDIDATE HANDLERS END  ----->

  // <----- ASSESSMENT HANDLERS START  ----->
  // Handles GET /assessments/:jobId (Fetch assessment structure)
  http.get("/assessments/:jobId", async ({ params }) => {
    const jobId = Number(params.jobId);
    const assessment = await db.assessments.get(jobId);

    if (assessment) {
      return HttpResponse.json(assessment);
    }
    // If no assessment exists, return a default empty structure
    return HttpResponse.json({ jobId, sections: [] });
  }),

  // Handles PUT /assessments/:jobId (Save/update assessment structure)
  http.put("/assessments/:jobId", async ({ request, params }) => {
    const jobId = Number(params.jobId);
    const assessmentData = await request.json();

    // .put() will add or update the record based on the primary key (jobId)
    await db.assessments.put({ jobId, ...assessmentData });

    return HttpResponse.json({ success: true });
  }),

  // Handles POST /assessments/:jobId/submit
  http.post("/assessments/:jobId/submit", async ({ request, params }) => {
    const { jobId } = params;
    const submissionData = await request.json();

    // In a real app, you'd save this to the database.
    // For this project, we'll just log it to simulate local persistence.
    console.log(`[MSW] Received submission for Job #${jobId}:`, submissionData);
    localStorage.setItem(
      `assessment_submission_${jobId}`,
      JSON.stringify(submissionData)
    );

    return HttpResponse.json({
      success: true,
      message: "Submission received.",
    });
  }),

  // <----- ASSESSMENT HANDLERS END  ----->
];
