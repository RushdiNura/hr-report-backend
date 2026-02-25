import fs from "fs";
import path from "path";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  ImageRun,
  TextRun,
} from "docx";

export const generateWord = async (report, fileName) => {
  const headers = [
    "Lakk",
    "Sektara Tajaajila Kenne",
    "Tajaajila Kenname",
    "Fooda",
    "Bayyina Namoota Tajaajilamni",
    "Hojjeta Taj. Kenne",
    "Guyyaa",
    "Ibsa",
  ];

  // Exact column widths from template
  const colWidths = [6, 20, 20, 10, 18, 12, 8, 6];

  const headerRow = new TableRow({
    height: { value: 400, rule: "exact" },
    children: headers.map((h, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        borders: border05(),
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: h,
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
        ],
      }),
    ),
  });

  const dataRows = (report.services || []).map((s, i) =>
    new TableRow({
      height: { value: 360, rule: "atLeast" },
      children: [
        cellCenter(i + 1),
        cellLeft(s.sector),
        cellLeft(s.service),
        cellLeft(s.resource),
        cellCenter(s.peopleServed),
        cellLeft(s.employee),
        cellCenter(formatDate(s.date)),
        cellLeft(s.remark),
      ],
    }),
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });

  // Signature
  let signaturePara;

  if (report.signature) {
    const sigPath = path.join(
      process.cwd(),
      "uploads",
      "signatures",
      report.signature,
    );

    if (fs.existsSync(sigPath)) {
      const img = fs.readFileSync(sigPath);

      signaturePara = new Paragraph({
        spacing: { before: 120 },
        children: [
          new TextRun({
            text: "Mallattoo: ",
            font: "Times New Roman",
            size: 24,
          }),
          new ImageRun({
            data: img,
            transformation: {
              width: 170,
              height: 70,
            },
          }),
        ],
      });
    }
  }

  if (!signaturePara) {
    signaturePara = new Paragraph({
      spacing: { before: 120 },
      children: [
        new TextRun({
          text: "Mallattoo: ______________________",
          font: "Times New Roman",
          size: 24,
        }),
      ],
    });
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
        children: [
          table,
          new Paragraph(""),
          new Paragraph({
            children: [
              new TextRun({
                text: `Maqaa Qindeessaa: ${report.coordinatorName || ""}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Guyyaa: ${formatDate(report.coordinatorDate) || ""}`,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          signaturePara,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(process.cwd(), "uploads", fileName);
  fs.writeFileSync(filePath, buffer);

  return filePath;
};

// helpers
function border05() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4 },
    bottom: { style: BorderStyle.SINGLE, size: 4 },
    left: { style: BorderStyle.SINGLE, size: 4 },
    right: { style: BorderStyle.SINGLE, size: 4 },
  };
}

function cellLeft(text) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: border05(),
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text || ""),
            font: "Times New Roman",
            size: 24,
          }),
        ],
      }),
    ],
  });
}

function cellCenter(text) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    borders: border05(),
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: String(text || ""),
            font: "Times New Roman",
            size: 24,
          }),
        ],
      }),
    ],
  });
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().split("T")[0];
}