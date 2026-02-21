// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { MongoClient } from "mongodb";
// import connectDB from "./src/config/db.js";

// import authRoutes from "./src/routes/authRoutes.js";
// import reportRoutes from "./src/routes/reportRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // static excel files
// app.use("/files", express.static("uploads"));

// app.use("/api/auth", authRoutes);
// app.use("/api/reports", reportRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { UPLOAD_DIR } from "./src/utils/uploadPath.js";
import authRoutes from "./src/routes/authRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

app.use("/files", express.static(UPLOAD_DIR));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
