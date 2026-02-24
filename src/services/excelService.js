import XLSX from "xlsx";
import path from "path";
import { UPLOAD_DIR } from "../utils/uploadPath.js";

export const generateExcel = (report, fileName) => {
  // ===== TABLE HEADER =====
  const header = [
    [
      "Lakk",
      "Sektara Tajaajila Kenne",
      "Tajaajila Kenname",
      "Fooda",
      "Bayyina Namoota Tajaajilamni",
      "Hojjeta Taj. Kenne",
      "Guyyaa",
      "Ibsa",
    ],
  ];

  // ===== TABLE ROWS (ONLY FILLED) =====
  const rows = report.services.map((s, i) => [
    i + 1,
    s.sector || "",
    s.service || "",
    s.resource || "",
    s.peopleServed || "",
    s.employee || "",
    s.date || "",
    s.remark || "",
  ]);

  const data = [...header, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // ===== AUTO COLUMN WIDTH =====
  const colWidths = data[0].map((_, colIndex) => {
    const maxLength = data.reduce((max, row) => {
      const cell = row[colIndex] ? row[colIndex].toString() : "";
      return Math.max(max, cell.length);
    }, 10);
    return { wch: maxLength + 2 };
  });

  ws["!cols"] = colWidths;

  // ===== FOOTER BELOW TABLE =====
  const footerStartRow = data.length + 2;

  XLSX.utils.sheet_add_aoa(
    ws,
    [
      ["Maqaa Qindeessaa:", report.coordinatorName],
      ["Guyyaa:", report.coordinatorDate],
      ["Mallattoo:", report.signature],
    ],
    { origin: `A${footerStartRow}` },
  );

  // ===== CREATE FILE =====
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gabaasaa");

  const filePath = path.join(UPLOAD_DIR, fileName);

  XLSX.writeFile(wb, filePath);

  return filePath;
};

// import XLSX from "xlsx";
// import path from "path";
// import { UPLOAD_DIR } from "../utils/uploadPath.js";

// export const generateExcel = (report, fileName) => {
//   // ===== HEADER =====
//   const header = [
//     "Lakk",
//     "Sektara Tajaajila Kenne",
//     "Tajaajila Kenname",
//     "Fooda",
//     "Bayyina Namoota Tajaajilamni",
//     "Hojjeta Taj. Kenne",
//     "Guyyaa",
//     "Ibsa",
//   ];

//   const rows = report.services.map((s, i) => [
//     i + 1,
//     s.sector || "",
//     s.service || "",
//     s.resource || "",
//     s.peopleServed || "",
//     s.employee || "",
//     s.date || "",
//     s.remark || "",
//   ]);

//   const data = [header, ...rows];

//   const ws = XLSX.utils.aoa_to_sheet(data);

//   // ===== COLUMN WIDTH AUTO =====
//   ws["!cols"] = header.map((_, colIndex) => {
//     const maxLength = data.reduce((max, row) => {
//       const val = row[colIndex] ? row[colIndex].toString() : "";
//       return Math.max(max, val.length);
//     }, header[colIndex].length);
//     return { wch: Math.min(maxLength + 3, 40) };
//   });

//   // ===== STYLES =====
//   const range = XLSX.utils.decode_range(ws["!ref"]);

//   for (let R = range.s.r; R <= range.e.r; ++R) {
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
//       if (!ws[cellRef]) continue;

//       ws[cellRef].s = {
//         border: {
//           top: { style: "thin" },
//           bottom: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//         },
//         alignment: {
//           vertical: "center",
//           horizontal: C === 0 || C === 4 ? "center" : "left",
//           wrapText: true,
//         },
//       };

//       // HEADER STYLE
//       if (R === 0) {
//         ws[cellRef].s.font = { bold: true };
//         ws[cellRef].s.alignment.horizontal = "center";
//       }
//     }
//   }

//   // ===== FOOTER BELOW TABLE =====
//   const footerStart = rows.length + 3;

//   XLSX.utils.sheet_add_aoa(
//     ws,
//     [
//       [],
//       ["Maqaa Qindeessaa:", report.coordinatorName],
//       ["Guyyaa:", report.coordinatorDate],
//       ["Mallattoo:", report.signature],
//     ],
//     { origin: `A${footerStart}` },
//   );

//   // ===== PRINT / PAGE SETUP =====
//   ws["!pageSetup"] = {
//     orientation: "portrait",
//     paperSize: 9, // A4
//   };

//   ws["!margins"] = {
//     left: 0.5,
//     right: 0.5,
//     top: 0.75,
//     bottom: 0.75,
//     header: 0.3,
//     footer: 0.3,
//   };

//   // ===== CREATE FILE =====
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Gabaasaa");

//   const filePath = path.join(UPLOAD_DIR, fileName);
//   XLSX.writeFile(wb, filePath);

//   return filePath;
// };

// import XLSX from "xlsx";
// import path from "path";
// import { UPLOAD_DIR } from "../utils/uploadPath.js";

// export const generateExcel = (report, fileName) => {
//   // ===== FILTER VALID SERVICES =====
//   const validServices = (report.services || []).filter(
//     (s) =>
//       s.sector ||
//       s.service ||
//       s.resource ||
//       s.peopleServed ||
//       s.employee ||
//       s.date ||
//       s.remark,
//   );

//   const services =
//     validServices.length > 0
//       ? validServices
//       : [
//           {
//             sector: "",
//             service: "",
//             resource: "",
//             peopleServed: "",
//             employee: "",
//             date: "",
//             remark: "",
//           },
//         ];

//   // ===== HEADER =====
//   const headerRow = [
//     "Lakk",
//     "Sektara\nTajaajila Kenne\n(Sector)",
//     "Tajaajila Kenname\n(Service)",
//     "Fooda\n(Resource)",
//     "Bayyina Namoota\nTajaajilamni\n(People Served)",
//     "Hojjeta\nTaj. Kenne\n(Employee)",
//     "Guyyaa\n(Date)",
//     "Ibsa\n(Remark)",
//   ];

//   // ===== DATA ROWS =====
//   const rows = services.map((s, i) => [
//     i + 1,
//     s.sector || "",
//     s.service || "",
//     s.resource || "",
//     s.peopleServed || "",
//     s.employee || "",
//     s.date ? new Date(s.date).toISOString().slice(0, 10) : "",
//     s.remark || "",
//   ]);

//   const data = [headerRow, ...rows];

//   // ===== SHEET =====
//   const ws = XLSX.utils.aoa_to_sheet(data);

//   // ===== AUTO COLUMN WIDTH =====
//   ws["!cols"] = headerRow.map((_, col) => {
//     let max = 10;

//     const headerLines = headerRow[col].split("\n");
//     max = Math.max(max, ...headerLines.map((l) => l.length));

//     rows.forEach((r) => {
//       const len = (r[col] || "").toString().length;
//       if (len > max) max = len;
//     });

//     return { wch: Math.min(max + 3, 45) };
//   });

//   // ===== STYLING =====
//   const range = XLSX.utils.decode_range(ws["!ref"]);

//   for (let r = range.s.r; r <= range.e.r; r++) {
//     for (let c = range.s.c; c <= range.e.c; c++) {
//       const ref = XLSX.utils.encode_cell({ r, c });
//       if (!ws[ref]) continue;

//       ws[ref].s = {
//         border: {
//           top: { style: "thin" },
//           bottom: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//         },
//         alignment: {
//           vertical: "center",
//           horizontal: c === 0 || c === 4 ? "center" : "left",
//           wrapText: true,
//         },
//       };

//       if (r === 0) {
//         ws[ref].s.font = { bold: true };
//         ws[ref].s.fill = { fgColor: { rgb: "E6F0FA" } };
//         ws[ref].s.alignment.horizontal = "center";
//       }
//     }
//   }

//   // ===== FOOTER =====
//   const footerRow = data.length + 1;

//   const formattedDate = report.coordinatorDate
//     ? new Date(report.coordinatorDate).toISOString().slice(0, 10)
//     : "";

//   XLSX.utils.sheet_add_aoa(
//     ws,
//     [
//       [],
//       ["Maqaa Qindeessaa (Coordinator Name):", report.coordinatorName || ""],
//       ["Guyyaa (Date):", formattedDate],
//       ["Mallattoo (Signature):", report.signature || ""],
//     ],
//     { origin: `A${footerRow}` },
//   );

//   // style footer
//   for (let i = 0; i < 3; i++) {
//     const label = XLSX.utils.encode_cell({ r: footerRow + i, c: 0 });
//     const value = XLSX.utils.encode_cell({ r: footerRow + i, c: 1 });

//     if (ws[label]) {
//       ws[label].s = {
//         font: { bold: true },
//         alignment: { horizontal: "left", vertical: "center" },
//       };
//     }

//     if (ws[value]) {
//       ws[value].s = {
//         alignment: { horizontal: "left", vertical: "center" },
//       };
//     }
//   }

//   // ===== PRINT SETTINGS =====
//   ws["!pageSetup"] = {
//     orientation: "portrait",
//     paperSize: 9,
//     fitToWidth: 1,
//   };

//   ws["!margins"] = {
//     left: 0.5,
//     right: 0.5,
//     top: 0.75,
//     bottom: 0.75,
//   };

//   // ===== SAVE =====
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Gabaasaa");

//   const filePath = path.join(UPLOAD_DIR, fileName);
//   XLSX.writeFile(wb, filePath);

//   return filePath;
// };
