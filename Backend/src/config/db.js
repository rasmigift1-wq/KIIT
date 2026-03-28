import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Testing MongoDB Connection...");
console.log(
  "URI:",
  process.env.MONGO_URI.replace(/\/\/.*@/, "//***:***@")
);

try {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  console.log("✅ MongoDB Connection SUCCESSFUL!");
  console.log("📚 Database:", mongoose.connection.name);
  console.log("🖥️ Host:", mongoose.connection.host);

  process.exit(0);
} catch (err) {
  console.error("❌ MongoDB Connection FAILED");
  console.error("Error:", err.message);

  if (err.message.includes("ETIMEDOUT")) {
    console.error("\n🔧 SOLUTIONS:");
    console.error("1. Check your internet connection");
    console.error("2. MongoDB Atlas: Add your IP to Network Access (0.0.0.0/0)");
    console.error("3. Try local MongoDB: mongodb://localhost:27017/dustbin");
    console.error("4. Check firewall/VPN settings");
  }

  process.exit(1);
}