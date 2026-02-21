import { MongoClient } from "mongodb";

// Use this EXACT connection string format - replace with your actual password
// const uri =
//   "mongodb+srv://rushdinurafita:DXG9Zdh2KmJN%5ELtt@cluster0.9updqnz.mongodb.net/?appName=Cluster0";
const uri =
  "mongodb+srv://test_user:qqZE1jESKP0YHHys@cluster0.9updqnz.mongodb.net/hr_reports?retryWrites=true&w=majority";

console.log("Testing connection...");
console.log("URI (password hidden):", uri.replace(/:[^:]*@/, ":****@"));

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ SUCCESS! Connected to MongoDB");

    // Try to list databases
    const dbs = await client.db().admin().listDatabases();
    console.log(
      "Available databases:",
      dbs.databases.map((db) => db.name),
    );
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    console.error("Full error:", err);
  } finally {
    await client.close();
  }
}

run();
