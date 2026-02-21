import Report from "../models/Report.js";
import { generateExcel } from "../services/excelService.js";

export const createReport = async (req, res) => {
  try {
    const { coordinatorName, coordinatorDate, signature, services } = req.body;

    if (!coordinatorName || !coordinatorDate || !signature) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedServices = services;
    if (typeof services === "string") {
      parsedServices = JSON.parse(services);
    }

    // generated file
    const generatedFileName = `Gabaasaa_${Date.now()}.xlsx`;

    await generateExcel(
      {
        coordinatorName,
        coordinatorDate,
        signature,
        services: parsedServices,
      },
      generatedFileName,
    );

    // uploaded file
    const uploadedFileName = req.file ? req.file.filename : null;

    const report = await Report.create({
      coordinatorName,
      coordinatorDate,
      signature,
      services: parsedServices,
      createdBy: req.user.id,
      generatedFileName,
      uploadedFileName,
    });

    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getReports = async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
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
// export const createReport = async (req, res) => {
//   try {
//     const { coordinatorName, coordinatorDate, signature, services } = req.body;

//     // create file name with extension
//     const fileName = `Gabaasaa_${Date.now()}.xlsx`;

//     // generate excel file
//     generateExcel(
//       { coordinatorName, coordinatorDate, signature, services },
//       fileName,
//     );

//     // save report in DB
//     const report = await Report.create({
//       coordinatorName,
//       coordinatorDate,
//       signature,
//       services,
//       createdBy: req.user.id,
//       fileName, // ← IMPORTANT: match frontend
//     });

//     // send report including fileName
//     res.status(201).json(report);
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };

// export const getReports = async (req, res) => {
//   const reports = await Report.find().sort({ createdAt: -1 });
//   res.json(reports);
// };

// export const getStats = async (req, res) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

//   const todayCount = await Report.countDocuments({
//     createdAt: { $gte: today },
//   });

//   const monthCount = await Report.countDocuments({
//     createdAt: { $gte: monthStart },
//   });

//   const totalCount = await Report.countDocuments();

//   res.json({
//     today: todayCount,
//     month: monthCount,
//     total: totalCount,
//   });
// };
