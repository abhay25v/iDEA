const path = require('path');
require(path.resolve(__dirname, '../apps/backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../.env'),
});
const mongoose = require(path.resolve(__dirname, '../apps/backend/node_modules/mongoose'));

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fintrace';

async function run() {
  try {
    console.log('Connecting to MongoDB at', uri);
    await mongoose.connect(uri, { autoIndex: false });

    const alerts = [
      {
        id: "ALR_001",
        type: "suspicious_withdrawal",
        severity: "high",
        title: "Suspicious Large Withdrawal",
        description: "Large withdrawal amount detected outside normal patterns",
        accountId: "ACC_001",
        fraudScore: 0.85,
        status: "open",
        createdAt: new Date("2026-05-10T10:00:00Z")
      },
      {
        id: "ALR_002",
        type: "multiple_failed_attempts",
        severity: "medium",
        title: "Multiple Failed Login Attempts",
        description: "3 failed login attempts detected from different IPs",
        accountId: "ACC_002",
        fraudScore: 0.65,
        status: "open",
        createdAt: new Date("2026-05-11T08:30:00Z")
      },
      {
        id: "ALR_003",
        type: "international_transaction",
        severity: "low",
        title: "International Transaction",
        description: "Transaction made to foreign account",
        accountId: "ACC_003",
        fraudScore: 0.35,
        status: "reviewed",
        investigatorId: "INV_001",
        createdAt: new Date("2026-05-09T14:20:00Z")
      },
      {
        id: "ALR_004",
        type: "velocity_check_failure",
        severity: "critical",
        title: "Rapid Sequential Transactions",
        description: "Multiple transactions within 5 minutes from same account",
        accountId: "ACC_001",
        fraudScore: 0.92,
        status: "open",
        createdAt: new Date("2026-05-11T11:45:00Z")
      }
    ];

    // Clear existing alerts
    await mongoose.connection.collection('alerts').deleteMany({});

    // Insert new alerts
    await mongoose.connection.collection('alerts').insertMany(alerts);
    console.log('✓ Seeded 4 alerts');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
