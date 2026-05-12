# FinTrace - Banking Fraud Detection Platform

A comprehensive fraud detection system for tracking suspicious transaction patterns, visualizing account networks, and generating compliance reports.

## 🎯 Features

### Core Capabilities
- **Transaction Analytics** - Comprehensive transaction tracking and trend analysis
- **Graph Visualization** - Interactive account networks via Neo4j
- **Real-time Risk Scoring** - ML-based fraud probability assessment
- **FIU Evidence Export** - Downloadable PDF reports with transaction evidence
- **Alert Management** - Centralized fraud alert handling and investigation
- **Account Inspection** - Deep-dive account analysis with full transaction history
- **Reports & Analytics** - Dashboard with fraud metrics, trends, and risk distribution
- **Role-Based Access** - Admin, Investigator, Auditor roles with RBAC
- **Audit Logging** - Complete investigation trail tracking

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** + **TypeScript**
- **TailwindCSS** for styling
- **SVG graphs** for network visualization
- **Axios** for API calls

### Backend
- **Node.js** + **Express.js**
- **TypeScript** with strict type checking
- **Mongoose** ODM for MongoDB
- **JWT** authentication + **RBAC**
- **PDFKit** for PDF generation

### Databases
- **MongoDB 7.0** - Transactions, accounts, alerts
- **Neo4j 5.12** - Account relationship graphs
- **Redis 7.2** - Caching layer

### ML Service
- **FastAPI** with Python 3.12
- **Heuristic-based** fraud scoring
- **Custom feature engineering**

### Deployment
- **Docker** containers
- **Docker Compose** for local development

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
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd FinTrace
```

2. **Setup environment**
```bash
cp .env.example .env
```

3. **Start services with Docker Compose**
```bash
docker compose up -d mongodb neo4j redis
```
Wait ~10 seconds for services to fully start.

4. **Seed sample data**
```bash
npm --prefix apps/backend run seed
```

5. **Start the backend**
```bash
cd apps/backend
npm install
npm run dev
```

6. **Start the frontend** (in a new terminal)
```bash
cd apps/frontend
npm install
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Neo4j Browser: http://localhost:7474
- MongoDB connection: `mongodb://127.0.0.1:27017/fintrace`

## 🔍 Local Development Setup

### Environment Variables for Local Dev

The default `.env.example` values work for local development with Docker Compose. Key settings:

```bash
# Use 127.0.0.1 (not localhost) to avoid IPv6 issues on Windows
MONGODB_URI=mongodb://127.0.0.1:27017/fintrace
NEO4J_URI=bolt://127.0.0.1:7687
REDIS_URL=redis://127.0.0.1:6379

# Set to localhost:3000 for CORS
CORS_ORIGIN=http://localhost:3000
```

### Database Connection

If running the backend locally *without* Docker Compose, use **IPv4 loopback** to avoid connection timeouts:

```powershell
# PowerShell
$env:MONGODB_URI="mongodb://127.0.0.1:27017/fintrace"
$env:NEO4J_URI="bolt://127.0.0.1:7687"
npm run dev
```

### Troubleshooting

**Backend won't start?**
- Ensure Docker services are running: `docker compose ps`
- Check MongoDB is healthy: `docker compose logs mongodb --tail 20`
- Verify port 5000 is not in use: `netstat -an | findstr :5000`

**Login fails?**
- Seed the database: `npm --prefix apps/backend run seed`
- Check MongoDB has users: `docker compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin`

**Can't connect to Neo4j?**
- Use `127.0.0.1` instead of `localhost` in connection URIs
- Check firewall isn't blocking port 7687

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
