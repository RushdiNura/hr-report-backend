// scripts/migrateToCloudinary.js
import fs from 'fs';
import path from 'path';
import { connectDB } from '../config/db.js';
import Report from '../models/Report.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

async function migrateReports() {
  await connectDB();
  
  const reports = await Report.find({ 
    generatedFileName: { $exists: true } 
  });
  
  for (const report of reports) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', report.generatedFileName);
      
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const result = await uploadToCloudinary(
          fileBuffer,
          report.generatedFileName,
          'hr-reports'
        );
        
        report.generatedFileUrl = result.secure_url;
        report.generatedFilePublicId = result.public_id;
        await report.save();
        
        console.log(`Migrated: ${report._id}`);
      }
    } catch (error) {
      console.error(`Failed to migrate ${report._id}:`, error);
    }
  }
  
  console.log('Migration complete');
  process.exit(0);
}

migrateReports();
