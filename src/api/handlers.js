import { http, HttpResponse } from "msw";
import { db } from "./db";

function arrayMove(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
  return arr;
}

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
];
