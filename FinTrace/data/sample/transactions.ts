// Sample Banking Transaction Data

export const sampleCustomers = [
  {
    id: 'CUST_001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    kycStatus: 'verified',
    riskScore: 0.15,
    annualIncome: 85000,
    occupationCategory: 'Finance',
    dateOfBirth: '1985-03-15',
    nationality: 'USA',
  },
  {
    id: 'CUST_002',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+1-555-0102',
    kycStatus: 'verified',
    riskScore: 0.12,
    annualIncome: 120000,
    occupationCategory: 'Technology',
    dateOfBirth: '1988-07-22',
    nationality: 'USA',
  },
  {
    id: 'CUST_003',
    name: 'Robert Johnson',
    email: 'r.johnson@email.com',
    kycStatus: 'pending',
    riskScore: 0.35,
    annualIncome: 45000,
    occupationCategory: 'Retail',
    nationality: 'USA',
  },
  {
    id: 'CUST_004',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    kycStatus: 'verified',
    riskScore: 0.08,
    annualIncome: 95000,
    occupationCategory: 'Healthcare',
    nationality: 'USA',
  },
  {
    id: 'CUST_005',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    kycStatus: 'rejected',
    riskScore: 0.75,
    annualIncome: 35000,
    occupationCategory: 'Services',
    nationality: 'USA',
  },
];

export const sampleAccounts = [
  // Customer 1
  { id: 'ACC_001', accountNumber: '1000001234', customerId: 'CUST_001', accountType: 'checking', status: 'active', balance: 15000, riskScore: 0.1 },
  { id: 'ACC_002', accountNumber: '1000005678', customerId: 'CUST_001', accountType: 'savings', status: 'active', balance: 85000, riskScore: 0.05 },
  
  // Customer 2
  { id: 'ACC_003', accountNumber: '2000001234', customerId: 'CUST_002', accountType: 'checking', status: 'active', balance: 32000, riskScore: 0.08 },
  { id: 'ACC_004', accountNumber: '2000005678', customerId: 'CUST_002', accountType: 'credit', status: 'active', balance: 0, riskScore: 0.15 },
  
  // Customer 3
  { id: 'ACC_005', accountNumber: '3000001234', customerId: 'CUST_003', accountType: 'checking', status: 'active', balance: 2100, riskScore: 0.4 },
  { id: 'ACC_006', accountNumber: '3000005678', customerId: 'CUST_003', accountType: 'savings', status: 'flagged', balance: 500, riskScore: 0.65 },
  
  // Customer 4
  { id: 'ACC_007', accountNumber: '4000001234', customerId: 'CUST_004', accountType: 'checking', status: 'active', balance: 22000, riskScore: 0.06 },
  { id: 'ACC_008', accountNumber: '4000005678', customerId: 'CUST_004', accountType: 'savings', status: 'active', balance: 155000, riskScore: 0.04 },
  
  // Customer 5 (High Risk)
  { id: 'ACC_009', accountNumber: '5000001234', customerId: 'CUST_005', accountType: 'checking', status: 'blocked', balance: 500, riskScore: 0.9 },
  { id: 'ACC_010', accountNumber: '5000005678', customerId: 'CUST_005', accountType: 'savings', status: 'flagged', balance: 100, riskScore: 0.85 },
];

export const sampleTransactions = [
  // Normal transactions
  { sourceAccountId: 'ACC_001', destinationAccountId: 'ACC_003', amount: 5000, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 7) },
  { sourceAccountId: 'ACC_003', destinationAccountId: 'ACC_001', amount: 2500, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 6) },
  { sourceAccountId: 'ACC_002', destinationAccountId: 'ACC_004', amount: 1000, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 5) },
  
  // Suspicious - Circular transfers (Money laundering pattern)
  { sourceAccountId: 'ACC_005', destinationAccountId: 'ACC_006', amount: 1500, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 3) },
  { sourceAccountId: 'ACC_006', destinationAccountId: 'ACC_007', amount: 1400, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 2.8) },
  { sourceAccountId: 'ACC_007', destinationAccountId: 'ACC_005', amount: 1350, type: 'transfer', timestamp: new Date(Date.now() - 86400000 * 2.5) },
  
  // Suspicious - Rapid layering
  { sourceAccountId: 'ACC_009', destinationAccountId: 'ACC_001', amount: 10000, type: 'transfer', timestamp: new Date(Date.now() - 3600000 * 4) },
  { sourceAccountId: 'ACC_001', destinationAccountId: 'ACC_003', amount: 9500, type: 'transfer', timestamp: new Date(Date.now() - 3600000 * 3) },
  { sourceAccountId: 'ACC_003', destinationAccountId: 'ACC_007', amount: 9000, type: 'transfer', timestamp: new Date(Date.now() - 3600000 * 2) },
  
  // Suspicious - Smurfing (Multiple small transactions)
  { sourceAccountId: 'ACC_010', destinationAccountId: 'ACC_002', amount: 9500, type: 'transfer', timestamp: new Date(Date.now() - 3600000) },
  
  // Suspicious - Dormant account activation
  { sourceAccountId: 'ACC_006', destinationAccountId: 'ACC_009', amount: 15000, type: 'transfer', timestamp: new Date(Date.now() - 7200000) },
];

export const sampleAlerts = [
  {
    type: 'suspicious_pattern',
    severity: 'critical',
    title: 'Circular Transfer Detected',
    description: 'Detected circular fund transfer between ACC_005, ACC_006, and ACC_007',
    accountId: 'ACC_005',
    transactionIds: [],
    fraudScore: 0.87,
    tags: ['layering', 'circular'],
  },
  {
    type: 'anomaly',
    severity: 'high',
    title: 'Rapid Fund Movement',
    description: 'Unusual rapid transfer chain detected',
    accountId: 'ACC_009',
    transactionIds: [],
    fraudScore: 0.78,
    tags: ['high-velocity', 'layering'],
  },
  {
    type: 'suspicious_pattern',
    severity: 'high',
    title: 'KYC-Income Mismatch',
    description: 'Large transaction from low-income account',
    accountId: 'ACC_010',
    transactionIds: [],
    fraudScore: 0.92,
    tags: ['kyc-mismatch'],
  },
];
