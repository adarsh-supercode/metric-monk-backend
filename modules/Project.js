import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js"; // Import User model

const Project = sequelize.define(
  "Project",
  {
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dataSource: {
      type: DataTypes.STRING,
      allowNull: false, // This could be "Google Analytics", "Hotjar", "Google Search Console", etc.
    },
    accountID: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null if not applicable (e.g., for Hotjar)
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null if not applicable (e.g., for Hotjar)
    },
    propertyName: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null if not applicable (e.g., for Hotjar)
    },
    propertyID: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Can be null if not applicable (e.g., for Hotjar)
    },
    UserId: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null if not applicable (e.g., for Hotjar)
    },
    // Add any other fields you might need, e.g., createdAt, updatedAt
  },
  {
    timestamps: true, // Enable createdAt and updatedAt fields
  }
);

// Set up a relation with User
Project.belongsTo(User, {
  foreignKey: {
    allowNull: false,
  },
});

export default Project;
