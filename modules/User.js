import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  googleAccessToken: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null initially
  },
  googleRefreshToken: {
    type: DataTypes.STRING,
    allowNull: true, // Can be null initially
  },
});

export default User;
