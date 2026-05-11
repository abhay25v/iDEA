// MongoDB Schemas

import mongoose, { Schema, Document } from 'mongoose';
import { User, Transaction, Account, Customer, Alert } from '@shared/types';

// User Schema
export type IUser = any;

const userSchema = new Schema<any>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'investigator', 'auditor'], default: 'investigator' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', userSchema);

// Transaction Schema
export type ITransaction = any;

const transactionSchema = new Schema<any>(
  {
    sourceAccountId: { type: String, required: true, index: true },
    destinationAccountId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['transfer', 'deposit', 'withdrawal', 'payment'], required: true },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'flagged'],
      default: 'pending',
    },
    timestamp: { type: Date, required: true, index: true },
    description: String,
    reference: { type: String, unique: true, sparse: true },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

transactionSchema.index({ sourceAccountId: 1, timestamp: -1 });
transactionSchema.index({ destinationAccountId: 1, timestamp: -1 });

export const TransactionModel = mongoose.model<ITransaction>('Transaction', transactionSchema);

// Account Schema
export type IAccount = any;

const accountSchema = new Schema<any>(
  {
    accountNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true, index: true },
    accountType: { type: String, enum: ['savings', 'checking', 'credit', 'loan'], required: true },
    status: { type: String, enum: ['active', 'inactive', 'blocked', 'flagged'], default: 'active' },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    riskScore: { type: Number, default: 0, min: 0, max: 1 },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    lastTransactionAt: Date,
  },
  { timestamps: true }
);

accountSchema.index({ customerId: 1 });
accountSchema.index({ riskScore: -1 });

export const AccountModel = mongoose.model<IAccount>('Account', accountSchema);

// Customer Schema
export type ICustomer = any;

const customerSchema = new Schema<any>(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    riskScore: { type: Number, default: 0, min: 0, max: 1 },
    annualIncome: Number,
    occupationCategory: String,
    dateOfBirth: Date,
    nationality: String,
  },
  { timestamps: true }
);

customerSchema.index({ riskScore: -1 });

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);

// Alert Schema
export type IAlert = any;

const alertSchema = new Schema<any>(
  {
    type: { type: String, enum: ['suspicious_pattern', 'anomaly', 'rule_violation', 'manual_report'], required: true },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    status: { type: String, enum: ['open', 'investigating', 'resolved', 'false_positive'], default: 'open' },
    title: { type: String, required: true },
    description: String,
    accountId: { type: String, required: true, index: true },
    transactionIds: [String],
    fraudScore: { type: Number, required: true, min: 0, max: 1 },
    investigatorId: String,
    dismissedBy: String,
    notes: String,
    tags: [String],
    reviewedAt: Date,
    resolvedAt: Date,
  },
  { timestamps: true }
);

alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ accountId: 1, createdAt: -1 });

export const AlertModel = mongoose.model<IAlert>('Alert', alertSchema);

// Risk Score Schema
export interface IRiskScore extends Document {
  accountId: string;
  score: number;
  components: {
    transactionRisk: number;
    networkRisk: number;
    behavioralRisk: number;
    kycRisk: number;
  };
  lastUpdated: Date;
}

const riskScoreSchema = new Schema<any>(
  {
    accountId: { type: String, required: true, unique: true, index: true },
    score: { type: Number, required: true, min: 0, max: 1 },
    components: {
      transactionRisk: { type: Number, default: 0 },
      networkRisk: { type: Number, default: 0 },
      behavioralRisk: { type: Number, default: 0 },
      kycRisk: { type: Number, default: 0 },
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RiskScoreModel = mongoose.model<IRiskScore>('RiskScore', riskScoreSchema);

// Audit Log Schema
export interface IAuditLog extends Document {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<any>(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    changes: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
