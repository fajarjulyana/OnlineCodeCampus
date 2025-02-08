import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const upload = multer({ dest: "public/uploads/" });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  upload.single("file")(req as any, res as any, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: filePath });
  });
}

