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

// Add this helper function at the top, after imports
const formatDateToDDMMYY = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
};

export const generateWord = async (report, fileName) => {
  try {
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

    const headerRow = new TableRow({
      children: [
        "Lakk",
        "Seektara Tajaajila Kenne",
        "Tajaajila Kenname",
        "Foddaa",
        "Baayyina Namoota Tajaajilamani",
        "Hojjetaa Taj. Kenne",
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
            verticalAlign: VerticalAlign.CENTER,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
            // width:
            //   text === "Lakk" || text === "Guyyaa"
            //     ? { size: 10, type: WidthType.DXA }
            //     : undefined,
          }),
      ),
    });

    const columnContentLengths = Array(8).fill(0);

    const headers = [
      "Lakk",
      "Seektara Tajaajila Kenne",
      "Tajaajila Kenname",
      "Foddaa",
      "Baayyina Namoota Tajaajilamani",
      "Hojjetaa Taj. Kenne",
      "Guyyaa",
      "Ibsa",
    ];
    headers.forEach((header, i) => {
      columnContentLengths[i] = Math.max(
        columnContentLengths[i],
        header.length,
      );
    });

    servicesToUse.forEach((s) => {
      const values = [
        "",
        s.sector || "",
        s.service || "",
        s.resource || "",
        s.peopleServed?.toString() || "",
        s.employee || "",
        s.date ? formatDateToDDMMYY(s.date) : "",
        s.remark || "",
      ];
      values.forEach((val, i) => {
        columnContentLengths[i] = Math.max(columnContentLengths[i], val.length);
      });
    });

    const bodyRows = servicesToUse.map((s, i) => {
      return new TableRow({
        children: [
          (i + 1).toString(),
          s.sector || "",
          s.service || "",
          s.resource || "",
          s.peopleServed?.toString() || "",
          s.employee || "",
          s.date ? formatDateToDDMMYY(s.date) : "",
          s.remark || "",
        ].map(
          (text, colIndex) =>
            new TableCell({
              children: [
                new Paragraph({
                  text,
                  alignment:
                    colIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                  spacing: { before: 50, after: 50 },
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
              // width:
              //   colIndex === 0 || colIndex === 6
              //     ? { size: 10, type: WidthType.DXA }
              //     : undefined,
            }),
        ),
      });
    });

    // const table = new Table({
    //   width: { size: 100, type: WidthType.AUTO },
    //   rows: [headerRow, ...bodyRows],
    //   borders: {
    //     top: { style: BorderStyle.SINGLE, size: 1 },
    //     bottom: { style: BorderStyle.SINGLE, size: 1 },
    //     left: { style: BorderStyle.SINGLE, size: 1 },
    //     right: { style: BorderStyle.SINGLE, size: 1 },
    //     insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
    //     insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    //   },
    // });

    const table = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      // check the comment
      columnWidths: [
        5, // Lakk
        15, // Sector
        15, // Service
        10, // Resource
        10, // People
        15, // Employee
        10, // Date
        20, // Remark
      ],
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

    const children = [
      new Paragraph({
        text: "GABAASA",
        heading: "Heading1",
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),

      table,

      new Paragraph({ text: "", spacing: { after: 200 } }),
    ];

    children.push(
      new Paragraph({
        text: `Maqaa Qindeessaa: ${report.coordinatorName || ""}`,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `Guyyaa: ${formatDateToDDMMYY(report.coordinatorDate)}`,
      }),
      new Paragraph({
        text: "Mallattoo:",
        spacing: { after: 50 },
      }),
    );

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

    const buffer = await Packer.toBuffer(doc);

    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Word document generated: ${fileName}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error generating Word document:", error);
    throw error;
  }
};
