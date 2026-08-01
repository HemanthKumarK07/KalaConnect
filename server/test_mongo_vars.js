import mongoose from 'mongoose';
import dns from 'dns';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
if (dns.setDefaultResultOrder) { dns.setDefaultResultOrder('ipv4first'); }

const testUris = [
  "mongodb+srv://KalaConnect:Ideathon2026@cluster0.8q1oghk.mongodb.net/KalaConnect?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://kalaconnect:Ideathon%402026@cluster0.8q1oghk.mongodb.net/KalaConnect?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://KalaConnect:ideathon%402026@cluster0.8q1oghk.mongodb.net/KalaConnect?retryWrites=true&w=majority&appName=Cluster0",
  "mongodb+srv://KalaConnect:Ideathon%402026@cluster0.8q1oghk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
];

async function testAll() {
  for (const uri of testUris) {
    console.log(`Testing URI: ${uri}`);
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Success for: ${uri}`);
      process.exit(0);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
    }
  }
  process.exit(1);
}

testAll();
