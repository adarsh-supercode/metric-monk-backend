import User from "../modules/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { email, password, fullName, organization } = req.body;

  try {
    // Validate input fields
    if (!email || !password || !fullName || !organization)
      return res.status(400).json({ msg: "One or more fields are missing" });

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      email,
      fullName,
      organization,
      password: hashedPassword,
    });

    // Generate a JWT token
    const payload = { userId: newUser.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Set token expiry time
    });

    // Return the token and the user data
    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ msg: "email and password Required" });
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMe = async (req, res) => {
  const { userId } = req.params; // Get userId from request parameters

  try {
    if (!userId) return res.status(400).json({ msg: "userId  Required" });
    // Fetch the user based on userId
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back user data (avoid sending sensitive information)
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
