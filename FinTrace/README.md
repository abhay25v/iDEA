# FinTrace - AI-Powered Banking Fraud Detection Platform

A production-grade fraud detection system that tracks movement of funds across accounts and detects suspicious transaction patterns using graph analytics and machine learning.

## 🎯 Features

### Core Capabilities
- **Transaction Ingestion Pipeline** - Real-time transaction import and normalization
- **Graph Relationship Mapping** - Account networks visualized using Neo4j
- **Fraud Topology Detection** - Identify circular transfers, layering, smurfing
- **ML Anomaly Detection** - Isolation Forest + Random Forest models
- **Real-time Alerts** - WebSocket-based live notification system
- **FIU Evidence Export** - Downloadable PDF reports with transaction chains
- **Risk Scoring Engine** - Multi-factor fraud probability calculation
- **KYC Profile Mismatch** - Behavioral deviation detection
- **Audit Logging** - Complete investigation trail tracking

### Fraud Patterns Detected
- ✅ Rapid layering schemes
- ✅ Circular fund transfers
- ✅ Round-tripping transactions
- ✅ Smurfing/structuring activities
- ✅ Dormant account activation
- ✅ High-frequency transfer chains
- ✅ KYC-income mismatches
- ✅ Money mule networks
- ✅ Geographic anomalies
- ✅ Device mismatch patterns

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** + **shadcn/ui** for modern UI
- **React Flow / Cytoscape.js** for graph visualization
- **Recharts** for analytics dashboards
- **WebSocket** for real-time updates

### Backend
- **Node.js** + **Express**
- **TypeScript** with strict mode
- **JWT** authentication + **RBAC**
- **Helmet** for security headers
- **Rate limiting** middleware
- **Request validation** schemas

### Databases
- **MongoDB** - Transaction records, alerts, logs
- **Neo4j** - Account relationships and fund movements
- **Redis** - Caching and real-time features

### ML Service
- **FastAPI** with Python 3.10+
- **Scikit-learn** - Isolation Forest, Random Forest
- **Pandas** - Feature engineering
- **NumPy** - Numerical computation

### Deployment
- **Docker** containers
- **Docker Compose** orchestration
- **MongoDB Atlas ready**
- **Neo4j AuraDB ready**

## 📁 Project Structure

```
FinTrace/
├── apps/
│   ├── frontend/           # Next.js 15 application
│   ├── backend/            # Express API server
│   └── ml-service/         # FastAPI microservice
├── packages/
│   └── shared/             # Shared TypeScript types
├── data/
│   └── sample/             # Sample transaction datasets
├── scripts/                # Setup and seeding scripts
├── docker/                 # Docker configurations
├── docs/                   # API documentation
├── docker-compose.yml      # Service orchestration
├── .env.example            # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- Neo4j 5.0+
- MongoDB 5.0+

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd FinTrace
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start services with Docker Compose**
```bash
docker-compose up -d
```

4. **Seed sample data**
```bash
npm run seed
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000
- Neo4j Browser: http://localhost:7687
- MongoDB Compass: localhost:27017

## 🔐 Authentication

### Default Credentials (Demo)
- **Admin**: admin@fintrace.io / AdminPass123!
- **Investigator**: investigator@fintrace.io / InvestigatorPass123!
- **Auditor**: auditor@fintrace.io / AuditorPass123!

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| Admin | Full access, user management, system config |
| Investigator | View transactions, alerts, export evidence |
| Auditor | Read-only access, audit logs |

## 📊 Dashboard Pages

### Implemented Pages
1. **Login Page** - JWT authentication with OTP ready
2. **Admin Dashboard** - System statistics and user management
3. **Fraud Investigator Dashboard** - Real-time alert monitoring
4. **Transaction Monitoring** - Live transaction stream
5. **Graph Visualization** - Interactive network explorer
6. **Alerts Management** - Alert triage and investigation
7. **Account Deep Inspection** - Account history and relationships
8. **Reports** - Pre-built fraud analytics reports
9. **FIU Export Center** - Evidence package generation
10. **Settings** - User preferences and system config

## 🔌 API Endpoints

```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/refresh
  POST   /api/auth/logout

Transactions:
  GET    /api/transactions
  POST   /api/transactions/import
  GET    /api/transactions/:id
  GET    /api/transactions/graph/:accountId

Accounts:
  GET    /api/accounts
  GET    /api/accounts/:id
  POST   /api/accounts/search
  GET    /api/accounts/:id/relationships

Alerts:
  GET    /api/alerts
  GET    /api/alerts/:id
  PATCH  /api/alerts/:id/status
  GET    /api/alerts/:id/evidence

Graph:
  GET    /api/graph/node/:nodeId
  POST   /api/graph/path/find
  GET    /api/graph/cluster/detect
  POST   /api/graph/traverse

Analytics:
  GET    /api/analytics/risk-distribution
  GET    /api/analytics/fraud-patterns
  GET    /api/analytics/velocity-trends
  POST   /api/analytics/export

ML:
  POST   /api/ml/predict
  POST   /api/ml/score-account
  GET    /api/ml/model-status
```

## 🗄️ Neo4j Graph Schema

```cypher
// Nodes
(:Customer)
  - customerId
  - name
  - kycStatus
  - riskScore

(:Account)
  - accountId
  - accountNumber
  - balance
  - createdAt
  - status

(:Transaction)
  - transactionId
  - amount
  - timestamp
  - type

(:Device)
  - deviceId
  - deviceType
  - ipAddress
  - location

(:Branch)
  - branchId
  - name
  - location

// Relationships
(:Customer)-[:OWNS]->(:Account)
(:Account)-[:TRANSFERRED_TO]->(:Account) [amount, timestamp]
(:Account)-[:DEPOSIT_FROM]->(:Account)
(:Account)-[:WITHDRAWAL_TO]->(:Account)
(:Customer)-[:USES_DEVICE]->(:Device)
(:Account)-[:ACCESSED_FROM]->(:Device)
(:Account)-[:LOCATED_AT]->(:Branch)
(:Customer)-[:IDENTIFIED_BY]->(:Device)
```

## 🤖 ML Models

### Anomaly Detection
- **Isolation Forest** - Unsupervised outlier detection
- **Random Forest** - Supervised fraud classification
- **Feature Engineering** - 25+ behavioral features

### Features Used
- Transaction amount & frequency
- Account age & velocity
- Geographic deviation
- Device mismatch & consistency
- Balance anomalies
- Time-of-day patterns
- Transfer network density

### Output
- Fraud probability (0-1)
- Anomaly score
- Feature importance breakdown
- Explanation & reasoning

## 📈 Dashboard Widgets

| Widget | Purpose |
|--------|---------|
| Total Suspicious Transactions | Real-time count |
| High-Risk Accounts | Risk tier distribution |
| Live Alerts | Active investigations |
| Fraud Heatmap | Geographic visualization |
| Network Graph | Relationship mapping |
| Risk Score Trends | Historical patterns |
| Top Flagged Branches | Hotspot identification |
| Velocity Analytics | Transaction rate anomalies |

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Request validation & sanitization
- ✅ Helmet security headers
- ✅ Rate limiting (100 req/min default)
- ✅ Encryption-ready architecture
- ✅ Audit logging for all actions
- ✅ CORS configured
- ✅ SQL injection prevention
- ✅ XSS protection

## 📦 Docker Deployment

### Services
- **Frontend** - Next.js on port 3000
- **Backend API** - Express on port 5000
- **ML Service** - FastAPI on port 8000
- **MongoDB** - Port 27017
- **Neo4j** - Port 7474/7687
- **Redis** - Port 6379

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build
```

## 📝 Environment Variables

See `.env.example` for complete configuration. Key variables:

```env
# Database
MONGODB_URI=mongodb://mongo:27017/fintrace
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Redis
REDIS_URL=redis://redis:6379

# Node Environment
NODE_ENV=production
```

## 🎓 Sample Data

The project includes sample banking transaction datasets with:
- 50+ customer profiles
- 150+ accounts
- 5,000+ transactions
- Pre-configured fraud scenarios
- Realistic patterns for demo purposes

Load sample data:
```bash
npm run seed:sample
npm run seed:neo4j
```

## 📊 Fraud Detection Workflow

```
1. Transaction Import
   ↓
2. Data Normalization & Validation
   ↓
3. MongoDB Storage & Indexing
   ↓
4. Neo4j Relationship Building
   ↓
5. Graph Pattern Analysis
   ↓
6. ML Anomaly Scoring
   ↓
7. Risk Score Calculation
   ↓
8. Alert Generation & Notification
   ↓
9. Investigator Dashboard Display
   ↓
10. Evidence Export & Audit Logging
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
npm test

# ML service tests
cd apps/ml-service
pytest
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Graph Schema](./docs/GRAPH_SCHEMA.md)
- [ML Models Guide](./docs/ML_MODELS.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Development Setup](./docs/DEVELOPMENT.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/xyz`
2. Commit changes: `git commit -m 'Add feature xyz'`
3. Push to branch: `git push origin feature/xyz`
4. Submit a Pull Request

## 📄 License

Proprietary - Banking Fraud Detection System

## 🆘 Support

For issues and questions:
- Open an issue on the repository
- Contact: support@fintrace.io
- Documentation: https://docs.fintrace.io

---

**Made with ❤️ for financial security**
