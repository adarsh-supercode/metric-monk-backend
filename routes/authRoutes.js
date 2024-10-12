import express from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Import the middleware

const router = express.Router();

// User signup route
router.post("/signup", signup);

// User login route
router.post("/login", login);

// User profile route (fetch user details) with token verification
router.get("/me/:userId", authenticateToken, getMe); // Use the middleware here

export default router;
