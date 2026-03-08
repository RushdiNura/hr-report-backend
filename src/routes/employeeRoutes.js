import express from "express";
import {
  createEmployee,
  getMyEmployees,
  deleteEmployee,
} from "../controllers/employeeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All employee routes require authentication and head role
router.use(authMiddleware, roleMiddleware("head"));

router.post("/", createEmployee);
router.get("/", getMyEmployees);
router.delete("/:id", deleteEmployee);

export default router;
