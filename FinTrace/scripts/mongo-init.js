// Initialize MongoDB with default database and collections

db = db.getSiblingDB('fintrace');

db.createCollection('users');
db.createCollection('customers');
db.createCollection('accounts');
db.createCollection('transactions');
db.createCollection('alerts');
db.createCollection('riskscores');
db.createCollection('auditlogs');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.accounts.createIndex({ customerId: 1 });
db.accounts.createIndex({ riskScore: -1 });
db.transactions.createIndex({ sourceAccountId: 1, timestamp: -1 });
db.transactions.createIndex({ destinationAccountId: 1, timestamp: -1 });
db.alerts.createIndex({ severity: 1, status: 1 });
db.alerts.createIndex({ accountId: 1, createdAt: -1 });
db.riskscores.createIndex({ accountId: 1 }, { unique: true });
db.auditlogs.createIndex({ userId: 1, createdAt: -1 });

print('MongoDB initialized successfully');
