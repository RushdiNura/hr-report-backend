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
// } from "docx";
// import fs from "fs";
// import path from "path";
// import { UPLOAD_DIR } from "../utils/uploadPath.js";

// export const generateWord = async (report, fileName) => {
//   // TEMPLATE COLUMN WIDTHS (match your docx)
//   const colWidths = [6, 20, 20, 10, 15, 15, 10, 14];

//   // HEADER
//   const headerRow = new TableRow({
//     children: [
//       "Lakk",
//       "Sektara",
//       "Tajaajila Kenne",
//       "Fooda",
//       "Bayyina Namoota",
//       "Hojjeta Taj. Kenne",
//       "Guyyaa",
//       "Ibsa",
//     ].map(
//       (text, i) =>
//         new TableCell({
//           width: { size: colWidths[i], type: WidthType.PERCENTAGE },
//           verticalAlign: VerticalAlign.CENTER,
//           children: [
//             new Paragraph({
//               text,
//               bold: true,
//               alignment: AlignmentType.CENTER,
//             }),
//           ],
//         }),
//     ),
//   });

//   // BODY ROWS — dynamic (your content)
//   const bodyRows = report.services.map((s, i) => {
//     return new TableRow({
//       children: [
//         i + 1,
//         s.sector || "",
//         s.service || "",
//         s.resource || "",
//         s.peopleServed || "",
//         s.employee || "",
//         s.date || "",
//         s.remark || "",
//       ].map(
//         (val, c) =>
//           new TableCell({
//             width: { size: colWidths[c], type: WidthType.PERCENTAGE },
//             verticalAlign: VerticalAlign.CENTER,
//             children: [
//               new Paragraph({
//                 text: String(val),
//               }),
//             ],
//           }),
//       ),
//     });
//   });

//   const table = new Table({
//     width: { size: 100, type: WidthType.PERCENTAGE },
//     rows: [headerRow, ...bodyRows],
//   });

//   // SIGNATURE IMAGE
//   let signatureBlock;

//   if (report.signatureImagePath && fs.existsSync(report.signatureImagePath)) {
//     const img = fs.readFileSync(report.signatureImagePath);

//     signatureBlock = new Paragraph({
//       children: [
//         new ImageRun({
//           data: img,
//           transformation: { width: 120, height: 50 },
//         }),
//       ],
//       spacing: { before: 50 },
//     });
//   } else {
//     signatureBlock = new Paragraph("________________", {
//       spacing: { before: 50 },
//     });
//   }

//   const doc = new Document({
//     sections: [
//       {
//         properties: {
//           page: {
//             margin: { top: 720, bottom: 720, left: 720, right: 720 },
//           },
//         },
//         children: [
//           table,

//           // spacing after table (template match)
//           new Paragraph({ text: "", spacing: { after: 200 } }),

//           new Paragraph(`Maqaa Qindeessaa  ${report.coordinatorName || ""}`, {
//             spacing: { after: 100 },
//           }),

//           new Paragraph(`Guyyaa            ${report.coordinatorDate || ""}`, {
//             spacing: { after: 100 },
//           }),

//           new Paragraph("Mallattoo", { spacing: { after: 50 } }),

//           signatureBlock,
//         ],
//       },
//     ],
//   });

//   const buffer = await Packer.toBuffer(doc);
//   const filePath = path.join(UPLOAD_DIR, fileName);
//   fs.writeFileSync(filePath, buffer);

//   return filePath;
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
} from "docx";
import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "../utils/uploadPath.js";

export const generateWord = async (report, fileName) => {
  try {
    // Filter out empty rows
    const validServices = report.services.filter(
      (s) => s.sector || s.service || s.employee,
    );

    const servicesToUse =
      validServices.length > 0
        ? validServices
        : [
            {
              sector: "",
              service: "",
              resource: "",
              peopleServed: "",
              employee: "",
              date: "",
              remark: "",
            },
          ];

    // Create header row with bold text
    const headerRow = new TableRow({
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
        (text) =>
          new TableCell({
            children: [
              new Paragraph({
                text,
                bold: true,
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: "E6F0FA",
            },
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
      ),
    });

    // Calculate max content length for each column to help with auto-sizing
    const columnContentLengths = Array(8).fill(0);

    // Check header lengths
    const headers = [
      "Lakk",
      "Sektara Tajaajila Kenne",
      "Tajaajila Kenname",
      "Foddaa",
      "Bayyina Namoota Tajaajilamani",
      "Hojjeta Taj. Kenne",
      "Guyyaa",
      "Ibsa",
    ];
    headers.forEach((header, i) => {
      columnContentLengths[i] = Math.max(
        columnContentLengths[i],
        header.length,
      );
    });

    // Check data rows
    servicesToUse.forEach((s) => {
      const values = [
        "",
        s.sector || "",
        s.service || "",
        s.resource || "",
        s.peopleServed?.toString() || "",
        s.employee || "",
        s.date ? new Date(s.date).toLocaleDateString("en-CA") : "",
        s.remark || "",
      ];
      values.forEach((val, i) => {
        columnContentLengths[i] = Math.max(columnContentLengths[i], val.length);
      });
    });

    // Create body rows
    const bodyRows = servicesToUse.map((s, i) => {
      return new TableRow({
        children: [
          (i + 1).toString(),
          s.sector || "",
          s.service || "",
          s.resource || "",
          s.peopleServed?.toString() || "",
          s.employee || "",
          s.date ? new Date(s.date).toLocaleDateString("en-CA") : "",
          s.remark || "",
        ].map(
          (text, colIndex) =>
            new TableCell({
              children: [
                new Paragraph({
                  text,
                  alignment:
                    colIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
        ),
      });
    });

    // Create the table with AUTO width (content-based)
    const table = new Table({
      width: { size: 100, type: WidthType.AUTO }, // Changed to AUTO for content-based width
      rows: [headerRow, ...bodyRows],
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });

    // Prepare document children array
    const children = [
      // Title
      new Paragraph({
        text: "GABAASAA",
        heading: "Heading1",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),

      // Table
      table,

      // Spacing after table
      new Paragraph({ text: "", spacing: { after: 200 } }),
    ];

    // Add coordinator info
    children.push(
      new Paragraph({
        text: `Maqaa Qindeessaa: ${report.coordinatorName || ""}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Guyyaa: ${report.coordinatorDate || ""}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: "Mallattoo:",
        spacing: { after: 50 },
      }),
    );

    // Add signature image if exists
    if (report.signatureImagePath && fs.existsSync(report.signatureImagePath)) {
      try {
        const imageBuffer = fs.readFileSync(report.signatureImagePath);

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: { width: 150, height: 60 },
                type: "png",
              }),
            ],
            spacing: { before: 50, after: 50 },
          }),
        );
      } catch (imgError) {
        console.error("Error adding signature image:", imgError);
        children.push(
          new Paragraph({
            text: "______________________",
            spacing: { before: 50, after: 50 },
          }),
        );
      }
    } else {
      children.push(
        new Paragraph({
          text: "______________________",
          spacing: { before: 50, after: 50 },
        }),
      );
    }

    // Create document with proper sections
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: children,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Save to file
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Word document generated: ${fileName}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error generating Word document:", error);
    throw error;
  }
};