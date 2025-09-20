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

    let jobsCollection = db.jobs;

    //Apply status filter if it exists
    if (status && status !== "all") {
      jobsCollection = jobsCollection.where("status").equals(status);
    }

    // Use the new, efficient multi-entry index for tag filtering
    if (tag) {
      jobsCollection = jobsCollection.where("tags").equals(tag);
    }

    let allJobs = await jobsCollection.toArray();

    //Apply search filter if it exists
    if (search) {
      allJobs = allJobs.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    //Respond with the filtered jobs
    if (!allJobs.length) {
      console.warn("Warning: No jobs found in database");
    }
    console.log("GET /jobs: ", allJobs);
    return HttpResponse.json(allJobs);
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
];
