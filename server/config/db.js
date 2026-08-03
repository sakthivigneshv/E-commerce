const mongoose = require('mongoose');
const dns = require('dns');
const seedInitialData = require('../utils/seedData');

// Use Google Public DNS to resolve SRV records on Windows Wi-Fi
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

let isMockMode = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vizhop', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[VizHop DB] MongoDB Connected: ${conn.connection.host}`);
    isMockMode = false;

    // Seed database collections automatically
    await seedInitialData();
  } catch (error) {
    console.warn(`[VizHop DB Warning] MongoDB Connection failed (${error.message}).`);
    console.log(`[VizHop DB] Switching to in-memory DB fallback for smooth local execution!`);
    isMockMode = true;
  }
};

const getIsMockMode = () => isMockMode;

module.exports = { connectDB, getIsMockMode };
