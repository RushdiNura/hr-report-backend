import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
} from "docx";
import fs from "fs";
import path from "path";
import { UPLOAD_DIR } from "../utils/uploadPath.js";

export const generateWord = async (report, fileName) => {
  const rows = report.services.map(
    (s, i) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(i + 1))] }),
          new TableCell({ children: [new Paragraph(s.sector || "")] }),
          new TableCell({ children: [new Paragraph(s.service || "")] }),
          new TableCell({ children: [new Paragraph(s.resource || "")] }),
          new TableCell({
            children: [new Paragraph(String(s.peopleServed || ""))],
          }),
          new TableCell({ children: [new Paragraph(s.employee || "")] }),
          new TableCell({ children: [new Paragraph(s.date || "")] }),
          new TableCell({ children: [new Paragraph(s.remark || "")] }),
        ],
      }),
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          "Lakk",
          "Sektara",
          "Tajaajila",
          "Fooda",
          "Bayyina",
          "Hojjeta",
          "Guyyaa",
          "Ibsa",
        ].map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ text: h, bold: true })],
            }),
        ),
      }),
      ...rows,
    ],
  });

  // ===== SIGNATURE IMAGE =====
  let signatureParagraph = new Paragraph("");

  if (report.signature) {
    const sigPath = path.join(
      process.cwd(),
      report.signature.replace("/files/", "uploads/"),
    );

    if (fs.existsSync(sigPath)) {
      const image = fs.readFileSync(sigPath);

      signatureParagraph = new Paragraph({
        children: [
          new ImageRun({
            data: image,
            transformation: {
              width: 120,
              height: 60,
            },
          }),
        ],
      });
    }
  }

  const doc = new Document({
    sections: [
      {
        children: [
          table,
          new Paragraph(""),
          new Paragraph(`Maqaa Qindeessaa: ${report.coordinatorName || ""}`),
          new Paragraph(`Guyyaa: ${report.coordinatorDate || ""}`),
          signatureParagraph,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return filePath;
};
