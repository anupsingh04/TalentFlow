// src/api/seed.js
import { db } from "./db";

export async function seedInitialData() {
  try {
    const jobCount = await db.jobs.count();
    if (jobCount > 0) {
      return; // Database already seeded
    }
    // Expanded list of 25 jobs with descriptions
    await db.jobs.bulkAdd(jobSeedData);

    console.log("Database seeded with 25 initial jobs.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

const jobSeedData = [
  {
    title: "Frontend Developer",
    description:
      "We are looking for a skilled Frontend Developer to build high-quality user interfaces.",
    slug: "frontend-developer",
    status: "active",
    tags: ["React", "CSS", "TypeScript"],
    order: 1,
  },
  {
    title: "Backend Engineer",
    description:
      "Design and implement scalable backend services with REST APIs and databases.",
    slug: "backend-engineer",
    status: "active",
    tags: ["Node.js", "SQL", "MongoDB"],
    order: 2,
  },
  {
    title: "Full Stack Developer",
    description:
      "Work across frontend and backend to deliver robust applications.",
    slug: "full-stack-developer",
    status: "archived",
    tags: ["React", "Node.js", "SQL"],
    order: 3,
  },
  {
    title: "DevOps Engineer",
    description: "Maintain CI/CD pipelines and cloud infrastructure.",
    slug: "devops-engineer",
    status: "active",
    tags: ["AWS", "Docker", "Kubernetes"],
    order: 4,
  },
  {
    title: "Data Scientist",
    description: "Analyze datasets and create predictive models.",
    slug: "data-scientist",
    status: "active",
    tags: ["Python", "Machine Learning", "SQL"],
    order: 5,
  },
  {
    title: "Machine Learning Engineer",
    description: "Deploy machine learning models into production pipelines.",
    slug: "ml-engineer",
    status: "archived",
    tags: ["Python", "Machine Learning", "Docker"],
    order: 6,
  },
  {
    title: "UI/UX Designer",
    description: "Design intuitive and user-friendly interfaces.",
    slug: "ui-ux-designer",
    status: "active",
    tags: ["React", "CSS", "Agile"],
    order: 7,
  },
  {
    title: "Mobile App Developer",
    description: "Develop cross-platform mobile apps with smooth performance.",
    slug: "mobile-app-developer",
    status: "active",
    tags: ["React", "Java", "Testing"],
    order: 8,
  },
  {
    title: "Cloud Architect",
    description: "Design secure and scalable cloud solutions.",
    slug: "cloud-architect",
    status: "archived",
    tags: ["AWS", "Kubernetes", "Docker"],
    order: 9,
  },
  {
    title: "QA Engineer",
    description: "Test applications thoroughly to ensure quality.",
    slug: "qa-engineer",
    status: "active",
    tags: ["Testing", "Agile", "SQL"],
    order: 10,
  },
  {
    title: "Security Engineer",
    description: "Implement security best practices and perform audits.",
    slug: "security-engineer",
    status: "active",
    tags: ["Java", "SQL", "Agile"],
    order: 11,
  },
  {
    title: "System Administrator",
    description: "Manage servers, networks, and IT infrastructure.",
    slug: "system-administrator",
    status: "archived",
    tags: ["Linux", "AWS", "Docker"],
    order: 12,
  },
  {
    title: "Database Administrator",
    description:
      "Maintain databases, ensure backups, and optimize performance.",
    slug: "database-administrator",
    status: "active",
    tags: ["SQL", "MongoDB", "Python"],
    order: 13,
  },
  {
    title: "AI Researcher",
    description:
      "Conduct research in artificial intelligence and publish findings.",
    slug: "ai-researcher",
    status: "active",
    tags: ["Python", "Machine Learning", "C++"],
    order: 14,
  },
  {
    title: "Product Manager",
    description: "Define product strategy and coordinate between teams.",
    slug: "product-manager",
    status: "archived",
    tags: ["Agile", "React", "SQL"],
    order: 15,
  },
  {
    title: "Technical Writer",
    description: "Create clear documentation for software systems.",
    slug: "technical-writer",
    status: "active",
    tags: ["Agile", "Testing", "SQL"],
    order: 16,
  },
  {
    title: "Game Developer",
    description: "Develop engaging games with smooth graphics.",
    slug: "game-developer",
    status: "active",
    tags: ["C++", "Java", "React"],
    order: 17,
  },
  {
    title: "Blockchain Developer",
    description: "Build decentralized applications and smart contracts.",
    slug: "blockchain-developer",
    status: "archived",
    tags: ["Java", "SQL", "Testing"],
    order: 18,
  },
  {
    title: "Site Reliability Engineer",
    description: "Ensure high availability and reliability of services.",
    slug: "sre",
    status: "active",
    tags: ["AWS", "Kubernetes", "SQL"],
    order: 19,
  },
  {
    title: "Network Engineer",
    description: "Design and maintain network infrastructure.",
    slug: "network-engineer",
    status: "active",
    tags: ["Linux", "Docker", "Agile"],
    order: 20,
  },
  {
    title: "Data Engineer",
    description: "Build and maintain data pipelines.",
    slug: "data-engineer",
    status: "archived",
    tags: ["Python", "SQL", "AWS"],
    order: 21,
  },
  {
    title: "Business Analyst",
    description:
      "Analyze requirements and bridge business needs with technical solutions.",
    slug: "business-analyst",
    status: "active",
    tags: ["Agile", "SQL", "React"],
    order: 22,
  },
  {
    title: "Support Engineer",
    description: "Provide technical support and troubleshoot issues.",
    slug: "support-engineer",
    status: "active",
    tags: ["Testing", "Agile", "SQL"],
    order: 23,
  },
  {
    title: "Embedded Systems Engineer",
    description: "Develop low-level software for embedded systems.",
    slug: "embedded-systems-engineer",
    status: "archived",
    tags: ["C++", "Python", "Testing"],
    order: 24,
  },
  {
    title: "AR/VR Developer",
    description: "Create immersive AR/VR experiences.",
    slug: "ar-vr-developer",
    status: "active",
    tags: ["React", "C++", "Java"],
    order: 25,
  },
];
