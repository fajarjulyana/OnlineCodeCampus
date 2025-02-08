import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema"; // Import skema database

// Membuka koneksi ke SQLite
const sqlite = new Database("database.db"); // Nama file database
export const db = drizzle(sqlite, { schema });

console.log("✅ Database connected successfully!");
