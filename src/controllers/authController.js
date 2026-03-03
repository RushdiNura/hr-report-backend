import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, qindeessaa } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Prepare user object
    const userFields = {
      name,
      email,
      password: hashed,
      role: role || "head", // Default to head if not specified in Postman
    };

    // Only assign qindeessaa if the user is NOT an HR
    if (userFields.role !== "hr") {
      userFields.qindeessaa = qindeessaa || "foddaa1";
    }

    const user = await User.create(userFields);

    res.status(201).json({
      message: `${user.role.toUpperCase()} created successfully`,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, qindeessaa: user.qindeessaa },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      // If HR, this will naturally be undefined/null in the DB
      qindeessaa: user.qindeessaa || null,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};