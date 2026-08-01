import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS resolution issue with MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if setServers fails
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const uri = "mongodb+srv://KalaConnect:Ideathon%402026@cluster0.8q1oghk.mongodb.net/KalaConnect?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  console.log("Attempting to connect to Atlas...");
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
