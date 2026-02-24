import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["hr", "head"],
      required: true,
    },
    qindeessaa: {
      type: String,
      enum: ["foddaa1", "foddaa2", "foddaa3", "foddaa4", "foddaa5", "foddaa6", 
             "foddaa7", "foddaa8", "foddaa9", "foddaa10", "foddaa11", "foddaa12"],
      default: "foddaa1",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);

