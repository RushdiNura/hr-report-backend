
import XLSX from "xlsx";
import path from "path";

export const generateExcel = (report, fileName) => {
  const rows = report.services.map((s, i) => ({
    Lakk: i + 1,
    "Sektara Tajaajila Kenne": s.sector,
    "Tajaajila Kenname": s.service,
    Fooda: s.resource,
    "Bayyina Namoota Tajaajilamni": s.peopleServed,
    "Hojjeta Taj. Kenne": s.employee,
    Guyyaa: s.date,
    Ibsa: s.remark,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // footer
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [],
      ["Maqaa Qindeessaa", report.coordinatorName],
      ["Guyyaa", report.coordinatorDate],
      ["Mallattoo", report.signature],
    ],
    { origin: -1 },
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Gabaasaa");

 const filePath = path.join(process.cwd(), "uploads", `${fileName}.xlsx`);

  XLSX.writeFile(workbook, filePath);

  return filePath;
};
