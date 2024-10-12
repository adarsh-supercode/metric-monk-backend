// index.js
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import googleEventsRoutes from "./routes/googleEventsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleAuthRoutes);
app.use("/api/reports", googleEventsRoutes);
app.use("/api/projects", projectRoutes);

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    return sequelize.sync({ alter: true }); // Sync models with database
  })
  .catch((err) => console.error("Unable to connect to the database:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
