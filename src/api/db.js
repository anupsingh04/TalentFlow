import Dexie from "dexie";

export const db = new Dexie("talentflowDB");

//Define the database schema (our "tables")
db.version(1).stores({
  jobs: "++id, slug, order",
  candidates: "++id, email",
  assessments: "++id, jobId",
});
