import express from "express";
import {
  createProject,
  deleteProjects,
  fetchProjects,
} from "../controllers/projectController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-project", authenticateToken, createProject);
router.delete("/delete-project/:propertyID", authenticateToken, deleteProjects);
router.get("/", authenticateToken, fetchProjects);

export default router;
