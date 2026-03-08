import express from "express";

import { register, login, logout, getHead, deleteHead } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/heads",authMiddleware, getHead);
router.delete("/heads/:id",authMiddleware, deleteHead);

export default router;
