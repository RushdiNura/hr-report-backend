import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, qindeessaa } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

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

export const getHead = async (req, res) => {
  try {
    const heads = await User.find({ role: "head" }).select("-password");
    res.json(heads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if it's a head user
    if (user.role !== "head") {
      return res.status(400).json({ message: "Can only delete head users" });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(id);
    
    res.json({ message: "Head user deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};