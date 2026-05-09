// MongoDB Seeding Script

import 'dotenv/config';
import mongoose from 'mongoose';
import { UserModel, CustomerModel, AccountModel, TransactionModel, AlertModel } from '@models/mongodb';
import { sampleCustomers, sampleAccounts, sampleTransactions, sampleAlerts } from '../../../data/sample/transactions';
import bcryptjs from 'bcryptjs';
import logger from '@utils/logger';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrace');
    logger.info('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      UserModel.deleteMany({}),
      CustomerModel.deleteMany({}),
      AccountModel.deleteMany({}),
      TransactionModel.deleteMany({}),
      AlertModel.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // Seed users
    const users = [
      {
        email: 'admin@fintrace.io',
        fullName: 'Admin User',
        password: await bcryptjs.hash('AdminPass123!', 10),
        role: 'admin',
        isActive: true,
      },
      {
        email: 'investigator@fintrace.io',
        fullName: 'John Investigator',
        password: await bcryptjs.hash('InvestigatorPass123!', 10),
        role: 'investigator',
        isActive: true,
      },
      {
        email: 'auditor@fintrace.io',
        fullName: 'Sarah Auditor',
        password: await bcryptjs.hash('AuditorPass123!', 10),
        role: 'auditor',
        isActive: true,
      },
    ];

    await UserModel.insertMany(users);
    logger.info('Users seeded');

    // Seed customers
    await CustomerModel.insertMany(sampleCustomers);
    logger.info('Customers seeded');

    // Seed accounts
    await AccountModel.insertMany(sampleAccounts);
    logger.info('Accounts seeded');

    // Seed transactions
    const txnData = sampleTransactions.map((txn) => ({
      id: `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...txn,
      status: 'completed',
      reference: `REF_${Date.now()}`,
    }));

    await TransactionModel.insertMany(txnData);
    logger.info('Transactions seeded');

    // Seed alerts
    const alertData = sampleAlerts.map((alert) => ({
      id: `ALR_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ...alert,
      status: 'open',
      createdAt: new Date(),
    }));

    await AlertModel.insertMany(alertData);
    logger.info('Alerts seeded');

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
