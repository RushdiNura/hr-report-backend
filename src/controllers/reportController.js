import Report from "../models/Report.js";
// import { generateExcel } from "../services/excelService.js";
import { generateWord } from "../services/wordService.js";
import { saveSignatureImage } from "../services/signatureService.js";
import {
  uploadToCloudinary,
  getSignedUrl,
} from "../services/cloudinaryService.js";
import fs from "fs";
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

    // Save signature image (kept local - it's small)
    let signatureFileName = null;
    if (signature && signature.startsWith("data:image")) {
      signatureFileName = await saveSignatureImage(signature);
      console.log("Signature saved:", signatureFileName);
    }

    // Generate Word document locally first
    const tempFileName = `Gabaasaa_${Date.now()}.docx`;
    const tempFilePath = await generateWord(
      {
        coordinatorName,
        coordinatorDate,
        signatureImagePath: signatureFileName
          ? path.join(process.cwd(), "uploads", "signatures", signatureFileName)
          : null,
        services: parsedServices,
      },
      tempFileName,
    );

    // Read the generated file into buffer
    const fileBuffer = fs.readFileSync(tempFilePath);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      fileBuffer,
      tempFileName,
      "hr-reports",
    );

    // Delete temporary file
    fs.unlinkSync(tempFilePath);

    // Handle uploaded file if present
    let uploadedFileUrl = null;
    if (req.file) {
      const userFileBuffer = fs.readFileSync(req.file.path);
      const userFileResult = await uploadToCloudinary(
        userFileBuffer,
        req.file.originalname,
        "hr-reports/user-uploads",
      );
      uploadedFileUrl = userFileResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Save to database with Cloudinary URLs
    const report = await Report.create({
      coordinatorName,
      coordinatorDate,
      signature,
      services: parsedServices,
      createdBy: req.user.id,
      qindeessaa: req.user.qindeessaa,
      signatureImage: signatureFileName,
      generatedFileUrl: cloudinaryResult.secure_url,
      generatedFilePublicId: cloudinaryResult.public_id,
      uploadedFileUrl: uploadedFileUrl,
    });

    // Get populated report to send via socket
    const populatedReport = await Report.findById(report._id).populate(
      "createdBy",
      "name qindeessaa",
    );

    // Generate signed URL for the populated report
    const reportObj = populatedReport.toObject();
    if (reportObj.generatedFilePublicId) {
      reportObj.downloadUrl = getSignedUrl(
        reportObj.generatedFilePublicId,
        3600,
      );
    }

    // Calculate updated stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const allReports = await Report.find({});
    const todayReports = allReports.filter(
      (r) => new Date(r.createdAt) >= today,
    );
    const monthReports = allReports.filter(
      (r) => new Date(r.createdAt) >= monthStart,
    );

    const calculateTotalPeople = (reports) => {
      return reports.reduce((total, r) => {
        if (r.extractedTotal) return total + r.extractedTotal;
        if (r.services && Array.isArray(r.services)) {
          const servicesTotal = r.services.reduce((sum, s) => {
            return sum + (parseInt(s.peopleServed) || 0);
          }, 0);
          return total + servicesTotal;
        }
        return total;
      }, 0);
    };

    const stats = {
      today: await Report.countDocuments({ createdAt: { $gte: today } }),
      month: await Report.countDocuments({ createdAt: { $gte: monthStart } }),
      total: await Report.countDocuments(),
      todayPeople: calculateTotalPeople(todayReports),
      monthPeople: calculateTotalPeople(monthReports),
      totalPeople: calculateTotalPeople(allReports),
    };

    // Emit socket events
    const io = req.app.get("io");
    if (io) {
      io.emit("newReport", reportObj);
      io.emit("statsUpdated", stats);
      console.log("📢 Socket events emitted for new report");
    }

    console.log("Report created:", report._id);
    res.status(201).json(reportObj);
  } catch (e) {
    console.error("Error creating report:", e);
    res.status(500).json({ message: e.message });
  }
};


export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("createdBy", "name qindeessaa")
      .sort({ createdAt: -1 });

    // Generate temporary signed URLs for each report
    const reportsWithUrls = reports.map((report) => {
      const reportObj = report.toObject();

      if (reportObj.generatedFilePublicId) {
        // Generate 1-hour signed URL
        reportObj.downloadUrl = getSignedUrl(
          reportObj.generatedFilePublicId,
          3600,
        );
      }

      return reportObj;
    });

    res.json(reportsWithUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

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


// export const createReport = async (req, res) => {
//   try {
//     console.log("Request body:", req.body);
//     console.log("Request file:", req.file);
//     const { coordinatorName, coordinatorDate, signature, services } = req.body;

//     if (!coordinatorName || !coordinatorDate || !signature) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const parsedServices =
//       typeof services === "string" ? JSON.parse(services) : services;

//     // Save signature image (kept local - it's small)
//     let signatureFileName = null;
//     if (signature && signature.startsWith("data:image")) {
//       signatureFileName = await saveSignatureImage(signature);
//       console.log("Signature saved:", signatureFileName);
//     }

//     // Generate Word document locally first
//     const tempFileName = `Gabaasaa_${Date.now()}.docx`;
//     const tempFilePath = await generateWord(
//       {
//         coordinatorName,
//         coordinatorDate,
//         signatureImagePath: signatureFileName
//           ? path.join(process.cwd(), "uploads", "signatures", signatureFileName)
//           : null,
//         services: parsedServices,
//       },
//       tempFileName,
//     );

//     // Read the generated file into buffer
//     const fileBuffer = fs.readFileSync(tempFilePath);
    
//     // Upload to Cloudinary (no local storage needed!)
//     const cloudinaryResult = await uploadToCloudinary(
//       fileBuffer, 
//       tempFileName,
//       'hr-reports'
//     );

//     // Delete temporary file
//     fs.unlinkSync(tempFilePath);

//     // Handle uploaded file if present (user-uploaded DOCX)
//     let uploadedFileUrl = null;
//     if (req.file) {
//       // Read user-uploaded file
//       const userFileBuffer = fs.readFileSync(req.file.path);
      
//       // Upload to Cloudinary
//       const userFileResult = await uploadToCloudinary(
//         userFileBuffer,
//         req.file.originalname,
//         'hr-reports/user-uploads'
//       );
      
//       uploadedFileUrl = userFileResult.secure_url;
      
//       // Delete temporary file
//       fs.unlinkSync(req.file.path);
//     }

//     // Save to database with Cloudinary URLs
//     const report = await Report.create({
//       coordinatorName,
//       coordinatorDate,
//       signature,
//       services: parsedServices,
//       createdBy: req.user.id,
//       qindeessaa: req.user.qindeessaa,
//       signatureImage: signatureFileName,
//       generatedFileUrl: cloudinaryResult.secure_url,
//       generatedFilePublicId: cloudinaryResult.public_id, // Add this to schema
//       uploadedFileUrl: uploadedFileUrl,
//     });

//     console.log("Report created:", report._id);
//     res.status(201).json(report);
    
//   } catch (e) {
//     console.error("Error creating report:", e);
//     res.status(500).json({ message: e.message });
//   }
// };

// Update getReports to include signed URLs


// export const getReports = async (req, res) => {
//   try {
//     const reports = await Report.find()
//       .populate("createdBy", "name qindeessaa")
//       .sort({ createdAt: -1 });
    
//     // Generate temporary signed URLs for each report
//     const reportsWithUrls = reports.map(report => {
//       const reportObj = report.toObject();
      
//       if (reportObj.generatedFilePublicId) {
//         // Generate 1-hour signed URL
//         reportObj.downloadUrl = getSignedUrl(reportObj.generatedFilePublicId, 3600);
//       }
      
//       return reportObj;
//     });
    
//     res.json(reportsWithUrls);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





// export const getStats = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

//     // Use aggregation for better performance with large datasets
//     const stats = await Report.aggregate([
//       {
//         $facet: {
//           counts: [
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: 1 },
//                 today: {
//                   $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] },
//                 },
//                 month: {
//                   $sum: { $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0] },
//                 },
//               },
//             },
//           ],
//           peopleSums: [
//             {
//               $group: {
//                 _id: null,
//                 totalPeople: {
//                   $sum: {
//                     $cond: [
//                       { $ifNull: ["$extractedTotal", false] },
//                       "$extractedTotal",
//                       { $sum: "$services.peopleServed" },
//                     ],
//                   },
//                 },
//                 todayPeople: {
//                   $sum: {
//                     $cond: [
//                       { $gte: ["$createdAt", today] },
//                       {
//                         $cond: [
//                           { $ifNull: ["$extractedTotal", false] },
//                           "$extractedTotal",
//                           { $sum: "$services.peopleServed" },
//                         ],
//                       },
//                       0,
//                     ],
//                   },
//                 },
//                 monthPeople: {
//                   $sum: {
//                     $cond: [
//                       { $gte: ["$createdAt", monthStart] },
//                       {
//                         $cond: [
//                           { $ifNull: ["$extractedTotal", false] },
//                           "$extractedTotal",
//                           { $sum: "$services.peopleServed" },
//                         ],
//                       },
//                       0,
//                     ],
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     const result = {
//       today: stats[0].counts[0]?.today || 0,
//       month: stats[0].counts[0]?.month || 0,
//       total: stats[0].counts[0]?.total || 0,
//       todayPeople: stats[0].peopleSums[0]?.todayPeople || 0,
//       monthPeople: stats[0].peopleSums[0]?.monthPeople || 0,
//       totalPeople: stats[0].peopleSums[0]?.totalPeople || 0,
//     };

//     res.json(result);
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };