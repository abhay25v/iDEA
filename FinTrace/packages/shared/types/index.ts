// Common types shared across frontend and backend

// ============= User & Auth Types =============
export type UserRole = 'admin' | 'investigator' | 'auditor';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
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

// ============= Transaction Types =============
export type TransactionType = 'transfer' | 'deposit' | 'withdrawal' | 'payment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'flagged';

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

// ============= Account Types =============
export type AccountStatus = 'active' | 'inactive' | 'blocked' | 'flagged';
export type AccountType = 'savings' | 'checking' | 'credit' | 'loan';

export interface Account {
  id: string;
  accountNumber: string;
  customerId: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  currency: string;
  createdAt: Date;
  lastTransactionAt?: Date;
  riskScore: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface AccountWithRelations extends Account {
  customer?: Customer;
  transactionCount?: number;
  linkedAccounts?: Account[];
  suspiciousTransactions?: number;
}

// ============= Customer Types =============
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  riskScore: number;
  annualIncome?: number;
  occupationCategory?: string;
  dateOfBirth?: Date;
  nationality?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= Alert Types =============
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type AlertType = 'suspicious_pattern' | 'anomaly' | 'rule_violation' | 'manual_report';

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
  createdAt: Date;
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

// ============= ML & Scoring Types =============
export interface MLPredictionInput {
  accountId: string;
  transactionAmount: number;
  transactionFrequency: number;
  accountAge: number;
  transferVelocity: number;
  geographicDeviation: boolean;
  deviceMismatch: boolean;
  balanceAnomaly: boolean;
  accountKYCStatus: string;
  lastTransactionTime?: number;
}

export interface MLPredictionOutput {
  fraudProbability: number;
  anomalyScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  features: Record<string, number>;
  explanation: string;
}

export interface RiskScore {
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

// ============= Graph Types =============
export interface GraphNode {
  id: string;
  label: string;
  type: 'customer' | 'account' | 'device' | 'branch' | 'bank';
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

// ============= Report Types =============
export interface FraudReport {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  startDate: Date;
  endDate: Date;
  transactionCount: number;
  accountsInvolved: string[];
  suspectedPattern: string;
  evidence: ReportEvidence[];
  investigatorNotes: string;
  createdAt: Date;
  createdBy: string;
}

export interface ReportEvidence {
  type: 'transaction' | 'graph_path' | 'ml_analysis' | 'behavioral';
  data: unknown;
  description: string;
  timestamp: Date;
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============= Query/Filter Types =============
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

// ============= WebSocket Event Types =============
export interface WebSocketMessage {
  type: 'alert' | 'update' | 'notification' | 'error';
  payload: unknown;
  timestamp: Date;
}

export interface RealTimeAlert extends WebSocketMessage {
  type: 'alert';
  payload: Alert;
}

// ============= Bulk Import Types =============
export interface BulkImportConfig {
  filePath: string;
  fileType: 'csv' | 'json' | 'parquet';
  batchSize: number;
  skipValidation?: boolean;
  dryRun?: boolean;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  rowIndex: number;
  error: string;
  data: unknown;
}

// ============= Feature Flags =============
export interface FeatureFlags {
  enableWebSocketAlerts: boolean;
  enableRealTimeProcessing: boolean;
  enableMLAnomaly: boolean;
  enableGraphVisualization: boolean;
  enablePDFExport: boolean;
  enableAdvancedReports: boolean;
}
