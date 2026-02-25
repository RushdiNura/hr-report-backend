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
} from "docx";
import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "../utils/uploadPath.js";

export const generateWord = async (report, fileName) => {
  // TEMPLATE COLUMN WIDTHS (match your docx)
  const colWidths = [6, 20, 20, 10, 15, 15, 10, 14];

  // HEADER
  const headerRow = new TableRow({
    children: [
      "Lakk",
      "Sektara",
      "Tajaajila Kenne",
      "Fooda",
      "Bayyina Namoota",
      "Hojjeta Taj. Kenne",
      "Guyyaa",
      "Ibsa",
    ].map(
      (text, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              text,
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
    ),
  });

  // BODY ROWS — dynamic (your content)
  const bodyRows = report.services.map((s, i) => {
    return new TableRow({
      children: [
        i + 1,
        s.sector || "",
        s.service || "",
        s.resource || "",
        s.peopleServed || "",
        s.employee || "",
        s.date || "",
        s.remark || "",
      ].map(
        (val, c) =>
          new TableCell({
            width: { size: colWidths[c], type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                text: String(val),
              }),
            ],
          }),
      ),
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });

  // SIGNATURE IMAGE
  let signatureBlock;

  if (report.signatureImagePath && fs.existsSync(report.signatureImagePath)) {
    const img = fs.readFileSync(report.signatureImagePath);

    signatureBlock = new Paragraph({
      children: [
        new ImageRun({
          data: img,
          transformation: { width: 120, height: 50 },
        }),
      ],
      spacing: { before: 50 },
    });
  } else {
    signatureBlock = new Paragraph("________________", {
      spacing: { before: 50 },
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          table,

          // spacing after table (template match)
          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph(`Maqaa Qindeessaa  ${report.coordinatorName || ""}`, {
            spacing: { after: 100 },
          }),

          new Paragraph(`Guyyaa            ${report.coordinatorDate || ""}`, {
            spacing: { after: 100 },
          }),

          new Paragraph("Mallattoo", { spacing: { after: 50 } }),

          signatureBlock,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  return filePath;
};
