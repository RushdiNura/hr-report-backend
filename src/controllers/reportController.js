import Report from "../models/Report.js";
// import { generateExcel } from "../services/excelService.js";
import { generateWord } from "../services/wordService.js";
import { saveSignatureImage } from "../services/signatureService.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createReport = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    const { coordinatorName, coordinatorDate, signature, services } = req.body;

    if (!coordinatorName || !coordinatorDate || !signature) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedServices =
      typeof services === "string" ? JSON.parse(services) : services;

    let signatureFileName = null;
    if (signature && signature.startsWith("data:image")) {
      signatureFileName = await saveSignatureImage(signature);

      console.log("Signature saved:", signatureFileName);
    }

    // generated file
    // const generatedFileName = `Gabaasaa_${Date.now()}.xlsx`;
    // generateExcel(
    //   {
    //     coordinatorName,
    //     coordinatorDate,
    //     signature,
    //     services: parsedServices,
    //   },
    //   generatedFileName,
    // );

    const generatedFileName = `Gabaasaa_${Date.now()}.docx`;
   await generateWord(
     {
       coordinatorName,
       coordinatorDate,
       signature: signatureFileName || "", // ✔ only filename
       services: parsedServices,
     },
     generatedFileName,
   );
    // await generateWord(
    //   {
    //     coordinatorName,
    //     coordinatorDate,
    //     signature: signatureFileName
    //       ? `/files/signatures/${signatureFileName}`
    //       : "",
    //     services: parsedServices,
    //   },
    //   generatedFileName,
    // );
    // uploaded file
    const uploadedFileName = req.file ? req.file.filename : null;

    const report = await Report.create({
      coordinatorName,
      coordinatorDate,
      signature,
      services: parsedServices,
      createdBy: req.user.id,
      qindeessaa: req.user.qindeessaa,
      signatureImage: signatureFileName,
      generatedFileName,
      uploadedFileName,
    });

    // const io = req.app.get("io");
    // io.emit("reportCreated");
    console.log("Report created:", report._id);
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getReports = async (req, res) => {
  const reports = await Report.find()
    .populate("createdBy", "name qindeessaa")
    .sort({ createdAt: -1 });
  res.json(reports);
};

export const getStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayCount = await Report.countDocuments({
    createdAt: { $gte: today },
  });

  const monthCount = await Report.countDocuments({
    createdAt: { $gte: monthStart },
  });

  const totalCount = await Report.countDocuments();

  res.json({
    today: todayCount,
    month: monthCount,
    total: totalCount,
  });
};
