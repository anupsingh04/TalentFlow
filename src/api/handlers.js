import { http, HttpResponse } from "msw";
import { db } from "./db";

export const handlers = [
  //Add API handlers here

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

    let filteredJobs = await jobsCollection.toArray();

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
];
