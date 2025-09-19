import { http, HttpResponse } from "msw";
import { db } from "./db";

export const handlers = [
  //Add API handlers here

  //Handles a GET /jobs request
  http.get("/jobs", async () => {
    //Get all jobs from our Dexie database (IndexedDB)
    const allJobs = await db.jobs.toArray();
    //respond with the jobs array in JSON format
    if (!allJobs.length) {
      console.warn("Warning: No jobs found in database");
    }
    console.log("GET /jobs", allJobs);
    return HttpResponse.json(allJobs);
  }),
];
