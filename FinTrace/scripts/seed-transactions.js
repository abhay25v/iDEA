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

    // Seed accounts
    const accounts = [
      {
        id: 'ACC_001',
        accountNumber: '1234567890',
        accountHolder: 'John Smith',
        status: 'active',
        balance: 50000,
        kycStatus: 'verified',
        riskScore: 0.15,
        createdAt: new Date('2024-01-15'),
        lastActivity: new Date(),
      },
      {
        id: 'ACC_002',
        accountNumber: '0987654321',
        accountHolder: 'Jane Doe',
        status: 'active',
        balance: 120000,
        kycStatus: 'verified',
        riskScore: 0.12,
        createdAt: new Date('2023-06-20'),
        lastActivity: new Date(),
      },
      {
        id: 'ACC_003',
        accountNumber: '1122334455',
        accountHolder: 'Robert Johnson',
        status: 'active',
        balance: 45000,
        kycStatus: 'pending',
        riskScore: 0.35,
        createdAt: new Date('2024-03-10'),
        lastActivity: new Date(),
      },
      {
        id: 'ACC_004',
        accountNumber: '5544332211',
        accountHolder: 'Maria Garcia',
        status: 'suspended',
        balance: 8000,
        kycStatus: 'verified',
        riskScore: 0.82,
        createdAt: new Date('2023-11-05'),
        lastActivity: new Date('2026-05-08'),
      },
      {
        id: 'ACC_005',
        accountNumber: '9876543210',
        accountHolder: 'Ahmed Hassan',
        status: 'active',
        balance: 95000,
        kycStatus: 'verified',
        riskScore: 0.08,
        createdAt: new Date('2024-02-14'),
        lastActivity: new Date(),
      },
    ];

    // Seed transactions
    const transactions = [
      {
        id: 'TXN_001',
        sourceAccountId: 'ACC_001',
        destinationAccountId: 'ACC_002',
        amount: 5000,
        type: 'transfer',
        timestamp: new Date('2026-05-11T10:30:00Z'),
        status: 'completed',
        reference: 'REF_001',
      },
      {
        id: 'TXN_002',
        sourceAccountId: 'ACC_002',
        destinationAccountId: 'ACC_003',
        amount: 3000,
        type: 'transfer',
        timestamp: new Date('2026-05-11T11:15:00Z'),
        status: 'completed',
        reference: 'REF_002',
      },
      {
        id: 'TXN_003',
        sourceAccountId: 'ACC_003',
        destinationAccountId: 'ACC_004',
        amount: 8000,
        type: 'transfer',
        timestamp: new Date('2026-05-11T12:00:00Z'),
        status: 'flagged',
        reference: 'REF_003',
      },
      {
        id: 'TXN_004',
        sourceAccountId: 'ACC_004',
        destinationAccountId: 'ACC_005',
        amount: 2000,
        type: 'withdrawal',
        timestamp: new Date('2026-05-11T13:45:00Z'),
        status: 'completed',
        reference: 'REF_004',
      },
      {
        id: 'TXN_005',
        sourceAccountId: 'ACC_005',
        destinationAccountId: 'ACC_001',
        amount: 5000,
        type: 'transfer',
        timestamp: new Date('2026-05-11T14:30:00Z'),
        status: 'completed',
        reference: 'REF_005',
      },
      {
        id: 'TXN_006',
        sourceAccountId: 'ACC_001',
        destinationAccountId: 'ACC_004',
        amount: 15000,
        type: 'transfer',
        timestamp: new Date('2026-05-10T09:00:00Z'),
        status: 'flagged',
        reference: 'REF_006',
      },
      {
        id: 'TXN_007',
        sourceAccountId: 'ACC_002',
        destinationAccountId: 'ACC_005',
        amount: 4500,
        type: 'transfer',
        timestamp: new Date('2026-05-10T15:30:00Z'),
        status: 'completed',
        reference: 'REF_007',
      },
      {
        id: 'TXN_008',
        sourceAccountId: 'ACC_004',
        destinationAccountId: 'ACC_001',
        amount: 12000,
        type: 'transfer',
        timestamp: new Date('2026-05-09T11:00:00Z'),
        status: 'flagged',
        reference: 'REF_008',
      },
    ];

    // Clear existing data
    await mongoose.connection.collection('accounts').deleteMany({});
    await mongoose.connection.collection('transactions').deleteMany({});

    // Insert data
    await mongoose.connection.collection('accounts').insertMany(accounts);
    console.log('✓ Seeded', accounts.length, 'accounts');

    await mongoose.connection.collection('transactions').insertMany(transactions);
    console.log('✓ Seeded', transactions.length, 'transactions');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
