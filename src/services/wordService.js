// import {
//   Document,
//   Packer,
//   Paragraph,
//   Table,
//   TableRow,
//   TableCell,
//   WidthType,
//   AlignmentType,
//   VerticalAlign,
//   ImageRun,
//   BorderStyle,
// } from "docx";
// import fs from "fs";
// import path from "path";
// import { UPLOAD_DIR } from "../utils/uploadPath.js";

// export const generateWord = async (report, fileName) => {
//   try {
//     const validServices = report.services.filter(
//       (s) => s.sector || s.service || s.employee,
//     );

//     const servicesToUse =
//       validServices.length > 0
//         ? validServices
//         : [
//             {
//               sector: "",
//               service: "",
//               resource: "",
//               peopleServed: "",
//               employee: "",
//               date: "",
//               remark: "",
//             },
//           ];

//     // Create header row with bold text only (no background)
//     const headerRow = new TableRow({
//       children: [
//         "Lakk",
//         "Sektara Tajaajila Kenne",
//         "Tajaajila Kenname",
//         "Foddaa",
//         "Bayyina Namoota Tajaajilamani",
//         "Hojjeta Taj. Kenne",
//         "Guyyaa",
//         "Ibsa",
//       ].map(
//         (text) =>
//           new TableCell({
//             children: [
//               new Paragraph({
//                 text,
//                 bold: true,
//                 alignment: AlignmentType.CENTER,
//               }),
//             ],
//             verticalAlign: VerticalAlign.CENTER,
//             borders: {
//               top: { style: BorderStyle.SINGLE, size: 1 },
//               bottom: { style: BorderStyle.SINGLE, size: 1 },
//               left: { style: BorderStyle.SINGLE, size: 1 },
//               right: { style: BorderStyle.SINGLE, size: 1 },
//             },
//             // Add minimum width for Lakk and Guyyaa columns
//             width:
//               text === "Lakk" || text === "Guyyaa"
//                 ? { size: 10, type: WidthType.DXA }
//                 : undefined,
//           }),
//       ),
//     });

//     // Calculate max content length for each column
//     const columnContentLengths = Array(8).fill(0);

//     // Check header lengths
//     const headers = [
//       "Lakk",
//       "Sektara Tajaajila Kenne",
//       "Tajaajila Kenname",
//       "Foddaa",
//       "Bayyina Namoota Tajaajilamani",
//       "Hojjeta Taj. Kenne",
//       "Guyyaa",
//       "Ibsa",
//     ];
//     headers.forEach((header, i) => {
//       columnContentLengths[i] = Math.max(
//         columnContentLengths[i],
//         header.length,
//       );
//     });

//     // Check data rows
//     servicesToUse.forEach((s) => {
//       const values = [
//         "",
//         s.sector || "",
//         s.service || "",
//         s.resource || "",
//         s.peopleServed?.toString() || "",
//         s.employee || "",
//         s.date ? new Date(s.date).toLocaleDateString("en-CA") : "",
//         s.remark || "",
//       ];
//       values.forEach((val, i) => {
//         columnContentLengths[i] = Math.max(columnContentLengths[i], val.length);
//       });
//     });

//     // Create body rows
//     const bodyRows = servicesToUse.map((s, i) => {
//       return new TableRow({
//         children: [
//           (i + 1).toString(),
//           s.sector || "",
//           s.service || "",
//           s.resource || "",
//           s.peopleServed?.toString() || "",
//           s.employee || "",
//           s.date ? new Date(s.date).toLocaleDateString("en-CA") : "",
//           s.remark || "",
//         ].map(
//           (text, colIndex) =>
//             new TableCell({
//               children: [
//                 new Paragraph({
//                   text,
//                   alignment:
//                     colIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
//                 }),
//               ],
//               verticalAlign: VerticalAlign.CENTER,
//               borders: {
//                 top: { style: BorderStyle.SINGLE, size: 1 },
//                 bottom: { style: BorderStyle.SINGLE, size: 1 },
//                 left: { style: BorderStyle.SINGLE, size: 1 },
//                 right: { style: BorderStyle.SINGLE, size: 1 },
//               },
//               // Add minimum width for Lakk and Guyyaa columns in body rows
//               width:
//                 colIndex === 0 || colIndex === 6
//                   ? { size: 10, type: WidthType.DXA }
//                   : undefined,
//             }),
//         ),
//       });
//     });

//     // Create the table with AUTO width
//     const table = new Table({
//       width: { size: 100, type: WidthType.AUTO },
//       rows: [headerRow, ...bodyRows],
//       borders: {
//         top: { style: BorderStyle.SINGLE, size: 1 },
//         bottom: { style: BorderStyle.SINGLE, size: 1 },
//         left: { style: BorderStyle.SINGLE, size: 1 },
//         right: { style: BorderStyle.SINGLE, size: 1 },
//         insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
//         insideVertical: { style: BorderStyle.SINGLE, size: 1 },
//       },
//     });

//     // Prepare document children array
//     const children = [
//       // Title
//       new Paragraph({
//         text: "GABAASAA",
//         heading: "Heading1",
//         alignment: AlignmentType.CENTER,
//         spacing: { after: 200 },
//       }),

//       // Table
//       table,

//       // Spacing after table
//       new Paragraph({ text: "", spacing: { after: 200 } }),
//     ];

//     // Add coordinator info
//     children.push(
//       new Paragraph({
//         text: `Maqaa Qindeessaa: ${report.coordinatorName || ""}`,
//         spacing: { after: 100 },
//       }),
//       new Paragraph({
//         text: `Guyyaa: ${report.coordinatorDate || ""}`,
//         spacing: { after: 100 },
//       }),
//       new Paragraph({
//         text: "Mallattoo:",
//         spacing: { after: 50 },
//       }),
//     );

//     // Add signature image if exists
//     if (report.signatureImagePath && fs.existsSync(report.signatureImagePath)) {
//       try {
//         const imageBuffer = fs.readFileSync(report.signatureImagePath);

//         children.push(
//           new Paragraph({
//             children: [
//               new ImageRun({
//                 data: imageBuffer,
//                 transformation: { width: 150, height: 60 },
//                 type: "png",
//               }),
//             ],
//             spacing: { before: 50, after: 50 },
//           }),
//         );
//       } catch (imgError) {
//         console.error("Error adding signature image:", imgError);
//         children.push(
//           new Paragraph({
//             text: "______________________",
//             spacing: { before: 50, after: 50 },
//           }),
//         );
//       }
//     } else {
//       children.push(
//         new Paragraph({
//           text: "______________________",
//           spacing: { before: 50, after: 50 },
//         }),
//       );
//     }

//     // Create document with proper sections
//     const doc = new Document({
//       sections: [
//         {
//           properties: {
//             page: {
//               margin: {
//                 top: 1440,
//                 bottom: 1440,
//                 left: 1440,
//                 right: 1440,
//               },
//             },
//           },
//           children: children,
//         },
//       ],
//     });

//     // Generate buffer
//     const buffer = await Packer.toBuffer(doc);

//     // Save to file
//     const filePath = path.join(UPLOAD_DIR, fileName);
//     fs.writeFileSync(filePath, buffer);

//     console.log(`✅ Word document generated: ${fileName}`);
//     return filePath;
//   } catch (error) {
//     console.error("❌ Error generating Word document:", error);
//     throw error;
//   }
// };

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  VerticalAlign,
  ImageRun,
  BorderStyle,
  ShadingType,
  HeadingLevel,
} from "docx";
import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "../utils/uploadPath.js";

export const generateWord = async (report, fileName) => {
  try {
    const validServices = report.services.filter(
      (s) =>
        s.sector ||
        s.service ||
        s.resource ||
        s.peopleServed ||
        s.employee ||
        s.remark,
    );

    const servicesToUse =
      validServices.length > 0 ? validServices : Array(7).fill({});

    const FONT_NAME = "Calibri";
    const FONT_SIZE = 22;
    const colWidths = [5, 20, 15, 10, 10, 15, 10, 15];

    const cellBorders = {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    };

    // Header Row
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        "Lakk",
        "Sektara Tajaajila Kenne",
        "Tajaajila Kenname",
        "Foddaa",
        "Bayyina Namoota Tajaajilamani",
        "Hojjeta Taj. Kenne",
        "Guyyaa",
        "Ibsa",
      ].map(
        (text, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: "D9D9D9" },
            verticalAlign: VerticalAlign.CENTER,
            borders: cellBorders,
            children: [
              new Paragraph({
                text,
                bold: true,
                alignment: AlignmentType.CENTER,
                font: FONT_NAME,
                size: FONT_SIZE,
              }),
            ],
          }),
      ),
    });

    // Body Rows
    const bodyRows = servicesToUse.map((s, i) => {
      let formattedDate = "";
      try {
        formattedDate = s.date
          ? new Date(s.date).toLocaleDateString("en-CA")
          : "";
      } catch {
        formattedDate = "";
      }

      const rowData = [
        (i + 1).toString(),
        s.sector || "",
        s.service || "",
        s.resource || "",
        s.peopleServed?.toString() || "",
        s.employee || "",
        formattedDate,
        s.remark || "",
      ];

      return new TableRow({
        children: rowData.map(
          (text, index) =>
            new TableCell({
              width: { size: colWidths[index], type: WidthType.PERCENTAGE },
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  text,
                  alignment:
                    index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                  font: FONT_NAME,
                  size: FONT_SIZE,
                }),
              ],
            }),
        ),
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
          },
          children: [
            new Paragraph({
              text: "GABAASAA",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              font: FONT_NAME,
              size: 28,
              spacing: { after: 300 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [headerRow, ...bodyRows],
            }),
            new Paragraph({ text: "", spacing: { before: 400 } }),
            new Paragraph({
              text: `Maqaa Qindeessaa: ${report.coordinatorName || "________________"}`,
              font: FONT_NAME,
              size: FONT_SIZE,
            }),
            new Paragraph({
              text: `Guyyaa: ${report.coordinatorDate || "_________________"}`,
              font: FONT_NAME,
              size: FONT_SIZE,
            }),
            new Paragraph({
              text: "Mallattoo:",
              font: FONT_NAME,
              size: FONT_SIZE,
            }),
            // Signature Logic
            ...(report.signatureImagePath &&
            fs.existsSync(report.signatureImagePath)
              ? [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: fs.readFileSync(report.signatureImagePath),
                        transformation: { width: 150, height: 60 },
                        type: "png",
                      }),
                    ],
                  }),
                ]
              : [new Paragraph({ text: "______________________" })]),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    throw error;
  }
};