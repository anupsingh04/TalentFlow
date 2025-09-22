import Dexie from "dexie";

export const db = new Dexie("talentflowDB");

//Define the database schema (our "tables")
db.version(1).stores({
  jobs: "++id, slug, order",
  candidates: "++id, email",
  assessments: "++id, jobId",
});

// Version 2 Schema - Add this block
db.version(2).stores({
  jobs: "++id, slug, order, status", // Add status as an index
});

// Version 3 Schema - Add this block
db.version(3).stores({
  jobs: "++id, slug, order, status, *tags", // Add *tags as a multi-entry index
});

// NEW: Version 4 Schema - Add this block
db.version(4).stores({
  jobs: "++id, slug, order, status, *tags, description", // Add description field
});
