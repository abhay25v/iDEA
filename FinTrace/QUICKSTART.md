// Quick Start Guide

## 🚀 5-Minute Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone and enter directory
cd FinTrace

# 2. Setup environment
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. Access services
# Frontend: http://localhost:3000
# API: http://localhost:5000
# ML Service: http://localhost:8000
# Neo4j: http://localhost:7474
```

**Login with**:
- Email: `admin@fintrace.io`
- Password: `AdminPass123!`

### Option 2: Local Development

```bash
# Backend
cd apps/backend && npm install && npm run dev

# Frontend (in new terminal)
cd apps/frontend && npm install && npm run dev

# ML Service (in new terminal)
cd apps/ml-service && pip install poetry && poetry install && poetry run uvicorn app.main:app --reload

# Access
# Frontend: http://localhost:3000
# API: http://localhost:5000
# ML: http://localhost:8000
```

## 📊 Database Setup

### MongoDB (Docker)
```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

### Neo4j (Docker)
```bash
docker run -d -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5.12
```

### Redis (Docker)
```bash
docker run -d -p 6379:6379 redis:7.2-alpine
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintrace.io | AdminPass123! |
| Investigator | investigator@fintrace.io | InvestigatorPass123! |
| Auditor | auditor@fintrace.io | AuditorPass123! |

## 📁 Project Structure

```
FinTrace/
├── apps/frontend/         # Next.js 15 React app
├── apps/backend/          # Express API server
├── apps/ml-service/       # FastAPI ML microservice
├── packages/shared/       # Shared TypeScript types
├── data/sample/           # Sample transaction data
├── scripts/               # Database seeding scripts
├── docs/                  # Documentation
├── docker-compose.yml     # Service orchestration
└── README.md              # Full documentation
```

## 🛠️ Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Seed databases
npm run seed && npm run seed:neo4j

# Build frontend
cd apps/frontend && npm run build

# Run tests
npm test
```

## 📚 Next Steps

1. **Read Documentation**
   - [Full README](./README.md)
   - [API Docs](./docs/API.md)
   - [Graph Schema](./docs/GRAPH_SCHEMA.md)
   - [ML Guide](./docs/ML_MODELS.md)

2. **Explore Features**
   - Login to dashboard
   - View sample transactions
   - Check fraud alerts
   - Analyze graphs

3. **Customize**
   - Update environment variables
   - Configure fraud thresholds
   - Add custom ML features
   - Modify alert rules

## 🐛 Troubleshooting

**Port conflicts?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000 && taskkill /PID <PID> /F  # Windows
```

**Database connection errors?**
```bash
# Check containers
docker ps

# View logs
docker logs <container-name>

# Restart
docker restart <container-name>
```

**Module not found?**
```bash
npm ci --omit=dev  # Clean install
poetry install     # Python dependencies
```

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 Email: dev@fintrace.io

## 📝 License

Proprietary - Banking Fraud Detection System

---

Happy analyzing! 🔍💰
