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

    // Use the new, efficient multi-entry index for tag filtering
    if (tag) {
      jobsCollection = jobsCollection.where("tags").equals(tag);
    }

    // 1. Fetch the filtered data from Dexie WITHOUT sorting it yet.
    let filteredJobs = await jobsCollection.toArray();

    // 2. NOW, sort the resulting array in JavaScript by the 'order' property.
    filteredJobs.sort((a, b) => a.order - b.order);

    //Apply search filter if it exists
    if (search) {
      filteredJobs = filteredJobs.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // --- Start of updated response logic ---
    // Get the total count *before* slicing for pagination
    const totalCount = filteredJobs.length;

    // Apply pagination to the filtered array
    const paginatedJobs = filteredJobs.slice(
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
    const newJobData = await request.json();

    // Ensure a default status is set
    const newJob = {
      status: "active", // Default status
      ...newJobData,
      //Simple slug generation
      slug: newJobData.title.toLowerCase().replace(/\s+/g, "-"),
    };

    //Add to database
    const id = await db.jobs.add(newJob);
    return HttpResponse.json({ ...newJob, id }, { status: 201 });
  }),

  //Handles PATCH /jobs/:id request (Update job)
  http.patch("/jobs/:id", async ({ request, params }) => {
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
  // <----- JOB HANDLERS END  ----->

  // <----- CANDIDATE HANDLERS START  ----->
  // Handles GET /candidates request
  http.get("/candidates", async ({ request }) => {
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
    // In a real app, this data would come from the database.
    // Here, we'll just mock a static timeline for demonstration.
    const timelineEvents = [
      {
        id: 1,
        date: "2025-09-18",
        event: "Applied for Senior Frontend Developer.",
      },
      { id: 2, date: "2025-09-19", event: "Moved to Screen stage by HR." },
      {
        id: 3,
        date: "2025-09-21",
        event: "Note added: 'Strong portfolio with React projects.'",
      },
      { id: 4, date: "2025-09-22", event: "Moved to Tech stage." },
    ];

    // Simulate a short delay
    await new Promise((res) => setTimeout(res, 300));

    return HttpResponse.json(timelineEvents);
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
    const { id } = params;
    const { stage } = await request.json(); // Expecting { stage: "new-stage" }

    if (!stage) {
      return new HttpResponse(
        JSON.stringify({ message: "Stage is required" }),
        { status: 400 }
      );
    }

    try {
      await db.candidates.update(Number(id), { stage });
      const updatedCandidate = await db.candidates.get(Number(id));
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
];
