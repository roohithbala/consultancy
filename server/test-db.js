import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://roohithbalag23csd:Roohith18%40@cluster0.ebwtphk.mongodb.net/?appName=Cluster0";

async function test() {
    try {
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

test();
