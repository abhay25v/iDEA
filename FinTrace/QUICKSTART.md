# Quick Start Guide

## 🚀 Getting Started

### Docker Compose (Recommended)

```bash
# Start all services
cd FinTrace
docker-compose up -d

# Check status
docker-compose ps

# Access
Frontend:    http://localhost:3000
Backend API: http://localhost:5000
ML Service:  http://localhost:8000
Neo4j:       http://localhost:7474
```

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintrace.io | AdminPass123! |
| Investigator | investigator@fintrace.io | InvestigatorPass123! |
| Auditor | auditor@fintrace.io | AuditorPass123! |

### Local Development

```bash
# Terminal 1: Backend
cd apps/backend
npm install
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm install
npm run dev

# Terminal 3: ML Service (optional)
cd apps/ml-service
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## ️ Common Commands

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

**ML service import error?**
Use `app.main:app`, not `main:app`:
```bash
cd apps/ml-service
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If `poetry` is not installed on your machine, use the active Python environment instead:
```powershell
cd D:\Download\iDEA\FinTrace\apps\ml-service
py -3.12 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
