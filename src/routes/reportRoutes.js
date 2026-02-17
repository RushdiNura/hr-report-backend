import express from "express";
import {
  createReport,
  getReports,
  getStats,
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("head"), createReport);
router.get("/", authMiddleware, roleMiddleware("hr"), getReports);
router.get("/stats", authMiddleware, roleMiddleware("hr"), getStats);

export default router;
