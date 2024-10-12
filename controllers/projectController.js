import Project from "../modules/Project.js"; // Import the Project model
import User from "../modules/User.js";
import { google } from "googleapis";

export const createProject = async (req, res) => {
  const {
    projectName,
    dataSource,
    accountID,
    propertyID,
    propertyName,
    accountName,
  } = req.body;
  const UserId = req.user.userId; // Get the userId from the request
  console.log("UserId: ", UserId);

  try {
    // Validate input
    if (!projectName || !dataSource) {
      return res
        .status(400)
        .json({ msg: "Project name and data source are required." });
    }

    // Create a new project in the database and associate it with the user
    const newProject = await Project.create({
      projectName,
      dataSource,
      accountID,
      propertyName,
      accountName,
      propertyID,
      UserId,
    });

    res.status(201).json(newProject); // Respond with the created project
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const fetchProjects = async (req, res) => {
  const userId = req.user.userId; // Get userId from authenticated request

  try {
    // Fetch all projects for the authenticated user
    const projects = await Project.findAll({
      where: {
        UserId: userId, // Ensure the projects belong to the authenticated user
      },
    });

    if (projects.length <= 0) {
      return res.status(200).json({ msg: "No projects found." }); // Return 404 if no projects are found
    }

    res.status(200).json(projects); // Respond with the fetched projects
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteProjects = async (req, res) => {
  const UserId = req.user.userId; // Get userId from authenticated request
  const { propertyID } = req.params; // Get projectId from query parameters

  try {
    // Check if propertyID is provided
    if (!propertyID) {
      return res.status(400).json({ msg: "property ID is required." });
    }

    // // Find the project to delete
    const project = await Project.findOne({
      where: {
        propertyID: propertyID,
        UserId: UserId, // Ensure the project belongs to the authenticated user
      },
    });

    // // Check if the project exists
    if (!project) {
      return res.status(404).json({
        msg: "Project not found or you do not have permission to delete it.",
      });
    }

    // // Delete the project
    await Project.destroy({
      where: {
        propertyID: propertyID,
        UserId: UserId, // Ensure the project belongs to the authenticated user
      },
    });

    const user = await User.findOne({ where: { id: UserId } });
    if (user && user.googleAccessToken) {
      user.googleAccessToken = null;
      user.googleRefreshToken = null;
      await user.save();
    }

    res.status(200).json({ msg: "Project deleted successfully." }); // Respond with success message
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
