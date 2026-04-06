// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./src/config/db.js";
// import path from "path";
// import { fileURLToPath } from "url";

// import authRoutes from "./src/routes/authRoutes.js";
// import reportRoutes from "./src/routes/reportRoutes.js";
// import employeeRoutes from "./src/routes/employeeRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // Create uploads folder if it doesn't exist
// import fs from "fs";
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }
// if (!fs.existsSync("uploads/signatures")) {
//   fs.mkdirSync("uploads/signatures");
// }

// // Static files
// app.use("/files", express.static(path.join(__dirname, "uploads")));
// app.use(
//   "/files/signatures",
//   express.static(path.join(__dirname, "uploads/signatures")),
// );

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/reports", reportRoutes);
// app.use("/api/employees", employeeRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err);
//   res.status(500).json({ message: err.message });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http"; // Add this
import { Server } from "socket.io"; // Add this

import authRoutes from "./src/routes/authRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import employeeRoutes from "./src/routes/employeeRoutes.js";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://hr-report-frontend.onrender.com",
    ], // Add your frontend URLs
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
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

// Use httpServer instead of app.listen it is good for socket.io
httpServer.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
