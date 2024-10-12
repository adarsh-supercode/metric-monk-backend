import express from "express";
import { fetchGARealTimeData } from "../controllers/googleEventsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:propertyId", authenticateToken, fetchGARealTimeData);

export default router;
