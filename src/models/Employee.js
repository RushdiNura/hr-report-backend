import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qindeessaa: {
      type: String,
      enum: [
        "foddaa1",
        "foddaa2",
        "foddaa3",
        "foddaa4",
        "foddaa5",
        "foddaa6",
        "foddaa7",
        "foddaa8",
        "foddaa9",
        "foddaa10",
        "foddaa11",
        "foddaa12",
      ],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Employee", employeeSchema);
