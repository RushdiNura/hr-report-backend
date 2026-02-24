import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    sector: String,
    service: String,
    resource: String,
    peopleServed: Number,
    employee: String,
    date: Date,
    remark: String,
  },
  { _id: false },
);

const reportSchema = new mongoose.Schema(
  {
    coordinatorName: String,
    coordinatorDate: Date,
    signature: String,
    services: [serviceSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    },
    signatureImage: {
      type: String, 
    },
    generatedFileName: {
      type: String,
    },
    uploadedFileName: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);