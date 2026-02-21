import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root
const root = path.join(__dirname, "../../");

// single uploads folder
export const UPLOAD_DIR = path.join(root, "uploads");
