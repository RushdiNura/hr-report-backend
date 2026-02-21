// import express from "express";
// import {
//   createReport,
//   getReports,
//   getStats,
// } from "../controllers/reportController.js";

// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, roleMiddleware("head"), createReport);
// router.get("/", authMiddleware, roleMiddleware("hr"), getReports);
// router.get("/stats", authMiddleware, roleMiddleware("hr"), getStats);

// export default router;

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  createReport,
  getReports,
  getStats,
} from "../controllers/reportController.js";

import { UPLOAD_DIR } from "../utils/uploadPath.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===== ROUTES =====
router.post(
  "/",
  authMiddleware,
  roleMiddleware("head"),
  upload.single("uploadedFile"),
  createReport,
);

router.get("/", authMiddleware, roleMiddleware("hr"), getReports);
router.get("/stats", authMiddleware, roleMiddleware("hr"), getStats);

export default router;