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

// Version 5 Schema - Adds the 'stage' index to candidates
db.version(5).stores({
  jobs: "++id, slug, order, status, *tags, description", // Schema carried over
  candidates: "++id, email, stage", // Schema updated with new index
  assessments: "++id, jobId", // Schema carried over
});

// Version 6 Schema - Adds a 'notes' table
db.version(6).stores({
  jobs: "++id, slug, order, status, *tags, description",
  candidates: "++id, email, stage",
  assessments: "++id, jobId",
  notes: "++id, candidateId", // Links notes to a candidate
});

// Version 7 Schema - Defines the assessments table schema
db.version(7).stores({
  jobs: "++id, slug, order, status, *tags, description",
  candidates: "++id, email, stage",
  notes: "++id, candidateId",
  assessments: "&jobId", // '&' makes jobId a unique primary key
});

// Version 8 Schema - Adds jobId to candidates and a new timelineEvents table
db.version(8).stores({
  jobs: "++id, slug, order, status, *tags, description",
  candidates: "++id, email, stage, jobId", // Add jobId and make it an index
  notes: "++id, candidateId",
  assessments: "&jobId",
  timelineEvents: "++id, candidateId", // New table for events
});
