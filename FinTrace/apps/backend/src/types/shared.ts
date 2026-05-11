// Local backend shared types for TypeScript compilation

export type UserRole = 'admin' | 'investigator' | 'auditor' | string;
export type TransactionType = 'transfer' | 'deposit' | 'withdrawal' | 'payment' | string;
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'flagged' | string;
export type AccountStatus = 'active' | 'inactive' | 'blocked' | 'flagged' | string;
export type AccountType = 'savings' | 'checking' | 'credit' | 'loan' | string;
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | string;
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive' | string;
export type AlertType = 'suspicious_pattern' | 'anomaly' | 'rule_violation' | 'manual_report' | string;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
  password?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface Account {
  id: string;
  accountNumber: string;
  customerId: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  currency: string;
  createdAt?: Date;
  lastTransactionAt?: Date;
  riskScore: number;
  kycStatus: 'pending' | 'verified' | 'rejected' | string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kycStatus: 'pending' | 'verified' | 'rejected' | string;
  riskScore: number;
  annualIncome?: number;
  occupationCategory?: string;
  dateOfBirth?: Date;
  nationality?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionWithDetails extends Transaction {
  sourceAccount?: Account;
  destinationAccount?: Account;
  fraudScore?: number;
  anomalyScore?: number;
}

export interface AccountWithRelations extends Account {
  customer?: Customer;
  transactionCount?: number;
  linkedAccounts?: Account[];
  suspiciousTransactions?: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  accountId: string;
  transactionIds?: string[];
  fraudScore: number;
  createdAt?: Date;
  resolvedAt?: Date;
  investigatorId?: string;
  notes?: string;
  tags?: string[];
}

export interface AlertWithDetails extends Alert {
  account?: Account;
  customer?: Customer;
  investigator?: User;
  relatedAlerts?: Alert[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'customer' | 'account' | 'device' | 'branch' | 'bank' | string;
  properties: Record<string, unknown>;
  riskScore?: number;
  isFlagged?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight?: number;
  properties: Record<string, unknown>;
  timestamp?: Date;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWeight?: number;
  isSuspicious?: boolean;
}

export interface GraphCluster {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  density: number;
  suspiciousCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface TransactionFilter {
  accountId?: string;
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  maxAmount?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  isFlagged?: boolean;
}

export interface AlertFilter {
  severity?: AlertSeverity;
  status?: AlertStatus;
  type?: AlertType;
  dateRange?: { start: Date; end: Date };
  investigatorId?: string;
}
