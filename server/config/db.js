import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

dotenv.config();

// Fix for Windows DNS resolution issue with MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if setServers fails
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  console.log("DB URI loaded:", process.env.MONGODB_URI ? "Yes (Atlas)" : "No (Undefined/Fallback)");

  const options = {
    // Force IPv4 — fixes Windows DNS resolution failures with Atlas hostnames
    family: 4,
    // Give more time for initial server selection on slow networks
    serverSelectionTimeoutMS: 15000,
    // Keep connections alive to prevent pool re-resolution issues
    heartbeatFrequencyMS: 20000,
  };

  return mongoose.connect(process.env.MONGODB_URI, options)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
      // Exit so nodemon can restart and retry
      process.exit(1);
    });
};

export default connectDB;
