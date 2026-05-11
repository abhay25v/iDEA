# Testing & Verification Checklist

## 🧪 Pre-Deployment Testing

### Environment Setup
- [ ] `.env` file created with all required variables
- [ ] All required ports are available (3000, 5000, 8000, 27017, 7474, 6379)
- [ ] Docker and Docker Compose installed
- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed

### Docker Deployment
```bash
# Run these commands
docker-compose build
docker-compose up -d
docker-compose ps

# All services should show as "Up"
```

- [ ] Frontend container running
- [ ] Backend container running
- [ ] ML Service container running
- [ ] MongoDB container running
- [ ] Neo4j container running
- [ ] Redis container running

### Database Connectivity
```bash
# Test MongoDB
docker exec fintrace-mongodb mongosh --eval "db.adminCommand('ping')"

# Test Neo4j
curl -u neo4j:password http://localhost:7474

# Test Redis
docker exec fintrace-redis redis-cli ping
```

- [ ] MongoDB responds to ping
- [ ] Neo4j admin panel accessible at http://localhost:7474
- [ ] Redis responds with PONG

### Service Health
```bash
# Test each service health endpoint
curl http://localhost:5000/api/health
curl http://localhost:8000/health
curl http://localhost:3000
```

- [ ] Backend /api/health returns 200
- [ ] ML Service /health returns 200
- [ ] Frontend loads at http://localhost:3000

---

## 🔑 Authentication Testing

### Login Functionality
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter `admin@fintrace.io` / `AdminPass123!`
- [ ] Login succeeds and redirects to dashboard
- [ ] JWT token stored in localStorage

### Token Refresh
```bash
# Get access token from localStorage
# Wait for token to expire or manually test refresh endpoint
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer <refresh-token>"
```

- [ ] Token refresh returns new access token
- [ ] User remains logged in after token refresh
- [ ] 401 errors trigger automatic refresh

### RBAC Testing
- [ ] Admin can access all endpoints
- [ ] Investigator can access fraud detection endpoints
- [ ] Auditor has read-only access

---

## 📊 Dashboard Testing

### Dashboard Loads
- [ ] http://localhost:3000/dashboard loads
- [ ] Page shows metrics cards
- [ ] Recent alerts section displays
- [ ] Charts render without errors

### Metrics Display
- [ ] Total transactions count displayed
- [ ] High-risk accounts count shown
- [ ] Flagged alerts shown
- [ ] Average risk score calculated

### Chart Rendering
- [ ] Risk score distribution chart renders
- [ ] Chart shows correct data ranges
- [ ] Colors match risk levels (green/yellow/red)

---

## 🔄 Transaction Processing

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAccountId": "ACC_001",
    "destinationAccountId": "ACC_002",
    "amount": 1000,
    "type": "transfer",
    "description": "Test transaction"
  }'
```

- [ ] Transaction created successfully
- [ ] Response includes transaction ID
- [ ] Transaction appears in MongoDB
- [ ] Neo4j relationship created

### Get Transactions
```bash
curl http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>"
```

- [ ] Returns paginated results
- [ ] Includes correct fields (id, amount, status, etc.)
- [ ] Pagination works correctly

### Import Transactions
```bash
curl -X POST http://localhost:5000/api/transactions/import \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    {"sourceAccountId": "ACC_001", "destinationAccountId": "ACC_002", ...}
  ]'
```

- [ ] Bulk import succeeds
- [ ] All transactions created
- [ ] No duplicates in database

---

## 🧠 Fraud Detection Testing

### ML Service Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "ACC_001",
    "transaction_amount": 5000,
    "frequency": 0.8,
    "account_age": 365,
    "velocity": 0.9,
    "geographic_deviation": 0.7,
    "device_mismatch": 0.5,
    "balance_anomaly": 0.3,
    "kyc_status": "verified"
  }'
```

- [ ] ML Service responds with prediction
- [ ] Response includes fraud_probability (0-1)
- [ ] Response includes risk_level
- [ ] Response includes feature importance

### Batch Predictions
```bash
curl -X POST http://localhost:8000/batch-predict \
  -H "Content-Type: application/json" \
  -d '[...]'
```

- [ ] Batch endpoint accepts multiple predictions
- [ ] Returns array of results
- [ ] Performance is acceptable (< 1s for 100 records)

### Alert Generation
- [ ] High-fraud predictions generate alerts
- [ ] Alerts appear in dashboard
- [ ] Alert severity matches risk level

---

## 📈 Graph Analysis Testing

### Circular Transfer Detection
```bash
curl http://localhost:5000/api/graph/circular-transfers/ACC_001 \
  -H "Authorization: Bearer <token>"
```

- [ ] Returns detected circular paths
- [ ] Each path includes account sequence
- [ ] Includes transaction amounts and timestamps

### Rapid Layering Detection
```bash
curl http://localhost:5000/api/graph/rapid-layering/ACC_001 \
  -H "Authorization: Bearer <token>"
```

- [ ] Detects multi-hop transfer chains
- [ ] Returns path details
- [ ] Identifies rapid sequences (< 1 minute between hops)

### Money Mule Networks
```bash
curl http://localhost:5000/api/graph/money-mule-networks \
  -H "Authorization: Bearer <token>"
```

- [ ] Returns highly connected account clusters
- [ ] Shows connection count for each account
- [ ] Identifies hub accounts

### Shortest Path
```bash
curl -X POST http://localhost:5000/api/graph/shortest-path \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAccountId": "ACC_001",
    "destinationAccountId": "ACC_010"
  }'
```

- [ ] Finds shortest path between accounts
- [ ] Returns all intermediate accounts
- [ ] Shows total path weight

---

## 🎯 Alerts Management

### Alert Listing
- [ ] Alerts page loads at `/alerts`
- [ ] All alerts displayed in list
- [ ] Severity color-coded (red for critical, etc.)
- [ ] Status filter working

### Alert Filtering
- [ ] Filter by severity (critical, high, medium, low)
- [ ] Filter by status (open, investigating, resolved)
- [ ] Filter by type (suspicious_pattern, anomaly, etc.)
- [ ] Date range filtering works

### Alert Update
```bash
curl -X PATCH http://localhost:5000/api/alerts/ALR_001/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "investigating", "notes": "Manual review started"}'
```

- [ ] Alert status updated
- [ ] Notes saved
- [ ] Status change reflected in UI

---

## 🗄️ Database Testing

### MongoDB Verification
```bash
docker exec fintrace-mongodb mongosh \
  -u admin -p admin123 \
  --eval "use fintrace; db.transactions.count()"
```

- [ ] Collections created (users, transactions, accounts, etc.)
- [ ] Indexes created on key fields
- [ ] Sample data inserted
- [ ] Queries execute quickly

### Neo4j Verification
```bash
# Access http://localhost:7474
# Run: MATCH (n) RETURN COUNT(n)
```

- [ ] Graph contains customer and account nodes
- [ ] TRANSFERRED_TO relationships exist
- [ ] Queries execute efficiently
- [ ] Constraints applied (unique IDs)

---

## 🔒 Security Testing

### Rate Limiting
```bash
# Make 101 requests rapidly
for i in {1..101}; do
  curl http://localhost:5000/api/health
done
```

- [ ] Requests after limit are rejected
- [ ] 429 (Too Many Requests) returned
- [ ] Limit resets after timeout

### CORS
```bash
curl -i http://localhost:5000/api/health \
  -H "Origin: http://localhost:3000"
```

- [ ] CORS headers present
- [ ] Origin allowed from frontend

### Input Validation
```bash
# Test with invalid input
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sourceAccountId": "invalid"}'
```

- [ ] Invalid requests rejected with 400
- [ ] Validation error message returned
- [ ] No invalid data in database

### Authentication Required
```bash
curl http://localhost:5000/api/transactions
```

- [ ] Endpoints require Bearer token
- [ ] 401 returned without token
- [ ] Invalid token rejected

---

## 📱 Frontend UI Testing

### Responsive Design
- [ ] Desktop view (1920x1080) displays correctly
- [ ] Tablet view (768x1024) responsive
- [ ] Mobile view (375x667) functional
- [ ] Navigation works on all sizes

### Dark Theme
- [ ] Dark theme applied by default
- [ ] Text readable on dark background
- [ ] All components styled correctly
- [ ] Colors consistent

### Form Validation
- [ ] Login form requires email and password
- [ ] Invalid email rejected
- [ ] Empty fields show validation error
- [ ] Success messages display

---

## 🚀 Performance Testing

### Page Load Time
- [ ] Dashboard loads in < 2 seconds
- [ ] API responses < 500ms for queries
- [ ] ML predictions < 1 second
- [ ] Database queries < 100ms

### API Rate Limiting
- [ ] Can handle 100 requests/minute
- [ ] Performance degradation after limit
- [ ] Recovery after timeout

### Concurrent Users
- [ ] Backend handles 10+ concurrent connections
- [ ] No connection pool exhaustion
- [ ] Graceful degradation if exceeded

---

## 📋 Sample Data Verification

### Seed Execution
```bash
cd apps/backend
npm run seed
npm run seed:neo4j
```

- [ ] Seed scripts complete without errors
- [ ] Users created (Admin, Investigator, Auditor)
- [ ] 5+ customers created
- [ ] 10+ accounts created
- [ ] 100+ transactions created
- [ ] Sample alerts generated

### Data Consistency
- [ ] MongoDB and Neo4j stay in sync
- [ ] Foreign key relationships maintained
- [ ] No orphaned records

---

## 🐛 Error Handling

### Backend Errors
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing/invalid token
- [ ] 403 Forbidden for insufficient permissions
- [ ] 404 Not Found for missing resources
- [ ] 500 Server error for unhandled exceptions

### Frontend Error Display
- [ ] API errors shown to user
- [ ] Error messages clear and helpful
- [ ] No blank error screens
- [ ] Retry option provided

### Logging
```bash
docker-compose logs backend
docker-compose logs ml-service
```

- [ ] Errors logged with timestamps
- [ ] Error stack traces captured
- [ ] No sensitive data in logs

---

## ✅ Final Checklist

### Deployment Ready
- [ ] All services running
- [ ] All tests passing
- [ ] No console errors
- [ ] No unhandled promises
- [ ] All endpoints responding

### Documentation Complete
- [ ] README comprehensive
- [ ] API documentation accurate
- [ ] Setup guides clear
- [ ] Deployment guide ready

### Security
- [ ] Authentication working
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] Headers secure
- [ ] No hardcoded secrets

### Performance
- [ ] Page loads fast (< 2s)
- [ ] API responses quick (< 500ms)
- [ ] Database queries efficient
- [ ] No memory leaks

### Production Ready
- [ ] Code formatted and linted
- [ ] TypeScript strict mode enabled
- [ ] Error handling comprehensive
- [ ] Logging in place
- [ ] Docker images built
- [ ] Environment variables configured

---

## 🎉 System Ready for:
- ✅ Local development
- ✅ Docker deployment
- ✅ Hackathon demo
- ✅ Proof of concept
- ✅ Production deployment (with monitoring)
