import multer from "multer";
import { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@shared/db";
import { users, courses, enrollments, content } from "@shared/schema";
import { insertCourseSchema, insertContentSchema, insertEnrollmentSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

// Set up multer storage (customize this as needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Change the directory to where you want to store the files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Custom file name with timestamp
  },
});

const upload = multer({ storage: storage });

function requireAdmin(req: Request, res: any) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // 🚀 Get all courses
  app.get("/api/courses", async (_req, res) => {
    const result = await db.select().from(courses);
    res.json(result);
  });

  // 🚀 Get a single course by ID
  app.get("/api/courses/:id", async (req, res) => {
    const result = await db.select().from(courses).where(eq(courses.id, parseInt(req.params.id)));
    if (result.length === 0) return res.sendStatus(404);
    res.json(result[0]);
  });

  // 🚀 Create a new course with file upload
  app.post("/api/courses", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    const parsed = insertCourseSchema.parse(req.body);

    // Get the file info if uploaded
    const photoPath = req.file ? req.file.path : null;

    const [newCourse] = await db.insert(courses).values({
      ...parsed, 
      createdById: req.user.id, 
      photo: photoPath,  // Save the file path or URL in the database
    }).returning();

    res.status(201).json(newCourse);
  });

  // 🚀 Update course
  app.patch("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    const parsed = insertCourseSchema.partial().parse(req.body);
    const [updatedCourse] = await db.update(courses).set(parsed).where(eq(courses.id, parseInt(req.params.id))).returning();
    res.json(updatedCourse);
  });

  // 🚀 Delete course
  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    await db.delete(courses).where(eq(courses.id, parseInt(req.params.id)));
    res.sendStatus(204);
  });

  // 🚀 Get course content
  app.get("/api/courses/:courseId/content", async (req, res) => {
    const result = await db.select().from(content).where(eq(content.courseId, parseInt(req.params.courseId)));
    res.json(result);
  });

  // 🚀 Add content to a course
  app.post("/api/courses/:courseId/content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    const parsed = insertContentSchema.parse({ ...req.body, courseId: parseInt(req.params.courseId) });
    const [newContent] = await db.insert(content).values(parsed).returning();
    res.status(201).json(newContent);
  });

  // 🚀 Update content
  app.patch("/api/content/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    const parsed = insertContentSchema.partial().parse(req.body);
    const [updatedContent] = await db.update(content).set(parsed).where(eq(content.id, parseInt(req.params.id))).returning();
    res.json(updatedContent);
  });

  // 🚀 Delete content
  app.delete("/api/content/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    requireAdmin(req, res);

    await db.delete(content).where(eq(content.id, parseInt(req.params.id)));
    res.sendStatus(204);
  });

  // 🚀 Get enrollments for a user
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = await db
      .select({ course: courses })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, req.user.id));
    
    res.json(result);
  });

  // 🚀 Enroll user in a course
  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parsed = insertEnrollmentSchema.parse(req.body);
    const [enrollment] = await db.insert(enrollments).values({ userId: req.user.id, courseId: parsed.courseId }).returning();
    res.status(201).json(enrollment);
  });

  const httpServer = createServer(app);
  return httpServer;
}

