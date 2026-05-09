# Development Setup Guide

## Prerequisites

- Node.js 18+ or 20+
- Python 3.10+
- Docker & Docker Compose
- Neo4j 5.0+
- MongoDB 5.0+
- Redis 7.0+
- Git

## Local Development (Without Docker)

### 1. Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Setup environment
cp ../../.env.example ../../.env
# Edit .env with your local database credentials

# TypeScript compilation
npm run build

# Development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Seed sample data
npm run seed
npm run seed:neo4j
```

**Backend will run on**: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd apps/frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Formatting
npm run format
```

**Frontend will run on**: `http://localhost:3000`

### 3. ML Service Setup

```bash
cd apps/ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install poetry
poetry install

# Run development server
poetry run uvicorn app.main:app --reload

# Run tests
pytest
```

**ML Service will run on**: `http://localhost:8000`

### 4. Database Setup

#### MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

#### Neo4j

```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5.12
```

#### Redis

```bash
# Using Docker
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7.2-alpine
```

## Docker Development

### Start All Services

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000/docs
- MongoDB: mongodb://admin:admin123@localhost:27017
- Neo4j Browser: http://localhost:7474
- Redis: localhost:6379

## Environment Variables

Create `.env` file in root directory (copy from `.env.example`):

```env
# Databases
MONGODB_URI=mongodb://admin:admin123@localhost:27017/fintrace?authSource=admin
MONGODB_USER=admin
MONGODB_PASSWORD=admin123

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# URLs
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_URL=http://localhost:8000
```

## Development Workflow

### Making Changes

1. Create feature branch: `git checkout -b feature/xyz`
2. Make changes and commit: `git commit -m 'Add feature xyz'`
3. Push: `git push origin feature/xyz`
4. Create Pull Request

### Code Style

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier
- **Python**: Black + Pylint

Run formatting:

```bash
# Backend
cd apps/backend && npm run format

# Frontend  
cd apps/frontend && npm run format

# ML Service
cd apps/ml-service && poetry run black app/
```

### Linting

```bash
# Backend
npm run lint

# ML Service
poetry run pylint app/
```

### Type Checking

```bash
# Backend
npm run typecheck

# Frontend
npm run type-check

# ML Service
poetry run mypy app/
```

## Testing

### Backend

```bash
cd apps/backend
npm test                  # Run tests once
npm run test:watch      # Watch mode
```

### Frontend

```bash
cd apps/frontend
npm test
```

### ML Service

```bash
cd apps/ml-service
pytest                   # Run all tests
pytest -v               # Verbose
pytest --cov app/      # With coverage
```

## Debugging

### Backend

```bash
# Enable debug logging
DEBUG=fintrace:* npm run dev

# Node debugger
node --inspect dist/index.js
```

### Frontend

- Use Chrome DevTools (F12)
- Next.js provides excellent error overlays

### ML Service

```python
# Add to code
import pdb
pdb.set_trace()

# Or use Python debugger
poetry run pdb app/main.py
```

## Database Operations

### MongoDB

```bash
# Connect via MongoDB Compass
mongodb://admin:admin123@localhost:27017

# Or CLI
mongosh "mongodb://admin:admin123@localhost:27017" --authenticationDatabase admin

# View databases
show dbs

# Use fintrace database
use fintrace

# View collections
show collections

# Query example
db.transactions.find({}).limit(10)
```

### Neo4j

```bash
# Access Neo4j Browser
http://localhost:7474

# Or use cypher-shell
cypher-shell -u neo4j -p password

# Sample queries
MATCH (n) RETURN n LIMIT 10;
MATCH (a:Account)-[:TRANSFERRED_TO]->(b) RETURN a, b LIMIT 5;
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Errors

```bash
# Check if databases are running
docker ps

# View database logs
docker logs <container-name>

# Restart database
docker restart <container-name>
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Python venv issue
rm -rf venv
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate
pip install poetry
poetry install
```

## Performance Optimization

### Frontend
- Enable caching headers
- Minimize bundle size
- Lazy load components

### Backend
- Use database connection pooling
- Implement caching (Redis)
- Add proper indexing

### ML Service
- Cache model inference
- Batch predictions
- Use async/await

## Security Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Validate all inputs
- [ ] Sanitize database queries
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Add CORS restrictions
- [ ] Regular security audits

## Next Steps

1. Read [API Documentation](./API.md)
2. Check [Graph Schema](./GRAPH_SCHEMA.md)
3. Review [ML Models Guide](./ML_MODELS.md)
4. Explore [Deployment Guide](./DEPLOYMENT.md)
