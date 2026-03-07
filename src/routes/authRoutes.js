import express from "express";

import { register, login, logout, getHead, deleteHead } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/heads", getHead);
router.delete("/heads/:id", deleteHead);

export default router;
