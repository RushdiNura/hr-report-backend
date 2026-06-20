import Employee from "../models/Employee.js";

// Create employee (only for the logged-in head)
export const createEmployee = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Employee name is required" });
    }

    const employee = await Employee.create({
      name,
      createdBy: req.user.id,
      qindeessaa: req.user.qindeessaa, // Auto-assign head's department
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all employees for the logged-in head
export const getMyEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      createdBy: req.user.id,
      qindeessaa: req.user.qindeessaa,
    }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndDelete({
      _id: id,
      createdBy: req.user.id, // Ensure only owner can delete
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
