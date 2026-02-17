import Report from "../models/Report.js";
import { generateExcel } from "../services/excelService.js";

export const createReport = async (req, res) => {
  try {
    const { coordinatorName, coordinatorDate, signature, services } = req.body;

    const fileName = `Gabaasaa_${Date.now()}`;

    const excelPath = generateExcel(
      { coordinatorName, coordinatorDate, signature, services },
      fileName,
    );

    const report = await Report.create({
      coordinatorName,
      coordinatorDate,
      signature,
      services,
      createdBy: req.user.id,
      xlsxFile: excelPath,
    });

    res.json(report);
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
