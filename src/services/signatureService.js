import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const signaturesDir = path.join(process.cwd(), "uploads", "signatures");
if (!fs.existsSync(signaturesDir)) {
  fs.mkdirSync(signaturesDir, { recursive: true });
}

export const saveSignatureImage = (base64Data) => {
  return new Promise((resolve, reject) => {
    try {
      const matches = base64Data.match(
        /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/,
      );

      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 data");
      }

      const imageType = matches[1];
      const base64Image = matches[2];

      const fileName = `signature_${Date.now()}_${uuidv4()}.${imageType}`;
      const filePath = path.join(signaturesDir, fileName);

      const imageBuffer = Buffer.from(base64Image, "base64");
      fs.writeFileSync(filePath, imageBuffer);

      console.log(`Signature saved: ${fileName}`);
      resolve(fileName);
    } catch (error) {
      console.error("Error saving signature:", error);
      reject(error);
    }
  });
};

export const getSignaturePath = (fileName) => {
  return path.join(signaturesDir, fileName);
};
