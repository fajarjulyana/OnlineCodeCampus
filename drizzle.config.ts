import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // Memuat .env file

const DATABASE_PATH = process.env.DATABASE_PATH || "./database.sqlite";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    database: DATABASE_PATH, // SQLite menggunakan file path, bukan URL
  },
  strict: true, // Menjaga agar Drizzle lebih ketat terhadap perubahan skema
});

