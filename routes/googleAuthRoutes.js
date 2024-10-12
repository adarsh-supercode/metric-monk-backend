import express from "express";
import {
  redirectToGoogle,
  handleGoogleCallback,
  checkGoogleConnection,
  revokeGoogleConnection,
} from "../controllers/googleAuthController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Google Analytics OAuth
router.get("/redirect", authenticateToken, redirectToGoogle); // Initiate OAuth
router.get("/callback", handleGoogleCallback); // Handle callback
router.get("/check-connection", authenticateToken, checkGoogleConnection); // Check connection
router.post("/revoke", authenticateToken, revokeGoogleConnection); // Revoke connection

export default router;
