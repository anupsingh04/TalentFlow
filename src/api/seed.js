// src/api/seed.js
import { db } from "./db";

// This function will run when the app starts
export async function seedInitialData() {
  try {
    // Check if jobs already exist
    const jobCount = await db.jobs.count();
    if (jobCount > 0) {
      // console.log('Database already seeded.');
      return;
    }

    // Add some initial job data if the DB is empty
    await db.jobs.bulkAdd([
      {
        title: "Frontend Developer",
        slug: "frontend-developer",
        status: "active",
        tags: ["React", "TypeScript", "CSS"],
        order: 1,
      },
      {
        title: "Backend Engineer",
        slug: "backend-engineer",
        status: "active",
        tags: ["Node.js", "Express", "SQL"],
        order: 2,
      },
      {
        title: "UX/UI Designer",
        slug: "ux-ui-designer",
        status: "archived",
        tags: ["Figma", "Sketch"],
        order: 3,
      },
    ]);

    console.log("Database seeded with initial jobs.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
