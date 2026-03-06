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
        signatureImagePath: signatureFileName
          ? path.join(process.cwd(), "uploads", "signatures", signatureFileName)
          : null,
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

// export const getStats = async (req, res) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

//      const allReports = await Report.find({});

//      const todayReports = allReports.filter(
//        (report) => new Date(report.createdAt) >= today,
//      );

//      const monthReports = allReports.filter(
//        (report) => new Date(report.createdAt) >= monthStart,
//      );

//      const calculateTotalPeople = (reports) => {
//        return reports.reduce((total, report) => {
//          if (report.extractedTotal) {
//            return total + report.extractedTotal;
//          }
//          if (report.services && Array.isArray(report.services)) {
//            const servicesTotal = report.services.reduce((sum, service) => {
//              return sum + (parseInt(service.peopleServed) || 0);
//            }, 0);
//            return total + servicesTotal;
//          }
//          return total;
//        }, 0);
//      };

//   // Calculate total reports
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
//     todayPeople: calculateTotalPeople(todayReports),
//     monthPeople: calculateTotalPeople(monthReports),
//     totalPeople: calculateTotalPeople(allReports),
//   });
// };

export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Use aggregation for better performance with large datasets
    const stats = await Report.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                today: {
                  $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] },
                },
                month: {
                  $sum: { $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0] },
                },
              },
            },
          ],
          peopleSums: [
            {
              $group: {
                _id: null,
                totalPeople: {
                  $sum: {
                    $cond: [
                      { $ifNull: ["$extractedTotal", false] },
                      "$extractedTotal",
                      { $sum: "$services.peopleServed" },
                    ],
                  },
                },
                todayPeople: {
                  $sum: {
                    $cond: [
                      { $gte: ["$createdAt", today] },
                      {
                        $cond: [
                          { $ifNull: ["$extractedTotal", false] },
                          "$extractedTotal",
                          { $sum: "$services.peopleServed" },
                        ],
                      },
                      0,
                    ],
                  },
                },
                monthPeople: {
                  $sum: {
                    $cond: [
                      { $gte: ["$createdAt", monthStart] },
                      {
                        $cond: [
                          { $ifNull: ["$extractedTotal", false] },
                          "$extractedTotal",
                          { $sum: "$services.peopleServed" },
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const result = {
      today: stats[0].counts[0]?.today || 0,
      month: stats[0].counts[0]?.month || 0,
      total: stats[0].counts[0]?.total || 0,
      todayPeople: stats[0].peopleSums[0]?.todayPeople || 0,
      monthPeople: stats[0].peopleSums[0]?.monthPeople || 0,
      totalPeople: stats[0].peopleSums[0]?.totalPeople || 0,
    };

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};