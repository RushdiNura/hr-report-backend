// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./src/config/db.js";
// import { Server } from "socket.io";
// import http from "http";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// import { UPLOAD_DIR } from "./src/utils/uploadPath.js";
// import authRoutes from "./src/routes/authRoutes.js";
// import reportRoutes from "./src/routes/reportRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "https://hr-report-frontend.onrender.com",
//   },
// });

// // make io accessible in routes
// app.set("io", io);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR);
// }

// app.use("/files", express.static(UPLOAD_DIR));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/reports", reportRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err);
//   res.status(500).json({ message: err.message });
// });

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => console.log(`Server running on ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Create uploads folder if it doesn't exist
import fs from "fs";
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
if (!fs.existsSync("uploads/signatures")) {
  fs.mkdirSync("uploads/signatures");
}

// Static files
app.use("/files", express.static(path.join(__dirname, "uploads")));
app.use(
  "/files/signatures",
  express.static(path.join(__dirname, "uploads/signatures")),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/employees", employeeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));