import { User, InsertUser, Course, InsertCourse, Content, InsertContent, Enrollment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse, userId: number): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Content
  getContent(courseId: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content>;
  deleteContent(id: number): Promise<void>;
  
  // Enrollments
  getEnrollments(userId: number): Promise<Course[]>;
  createEnrollment(userId: number, courseId: number): Promise<Enrollment>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private contents: Map<number, Content>;
  private enrollments: Map<number, Enrollment>;
  private currentId: number;
  readonly sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.contents = new Map();
    this.enrollments = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    // Make the first user an admin
    const isFirstUser = this.users.size === 0;
    const user = { 
      ...insertUser, 
      id, 
      role: isFirstUser ? "admin" as const : "user" as const 
    };
    this.users.set(id, user);
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse, userId: number): Promise<Course> {
    const id = this.currentId++;
    const course = { ...insertCourse, id, createdById: userId };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const existing = await this.getCourse(id);
    if (!existing) throw new Error("Course not found");
    const updated = { ...existing, ...course };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
  }

  async getContent(courseId: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.courseId === courseId,
    );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentId++;
    const content = { ...insertContent, id };
    this.contents.set(id, content);
    return content;
  }

  async updateContent(id: number, content: Partial<InsertContent>): Promise<Content> {
    const existing = this.contents.get(id);
    if (!existing) throw new Error("Content not found");
    const updated = { ...existing, ...content };
    this.contents.set(id, updated);
    return updated;
  }

  async deleteContent(id: number): Promise<void> {
    this.contents.delete(id);
  }

  async getEnrollments(userId: number): Promise<Course[]> {
    const enrollments = Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId,
    );
    return Promise.all(
      enrollments.map((e) => this.getCourse(e.courseId)).filter((c): c is Course => !!c)
    );
  }

  async createEnrollment(userId: number, courseId: number): Promise<Enrollment> {
    const id = this.currentId++;
    const enrollment = {
      id,
      userId,
      courseId,
      enrolledAt: new Date(),
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }
}

export const storage = new MemStorage();