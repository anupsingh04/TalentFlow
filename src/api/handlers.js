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
];
