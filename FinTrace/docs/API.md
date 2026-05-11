# API Documentation

## Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@fintrace.io",
  "password": "AdminPass123!"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@fintrace.io",
      "fullName": "Admin User",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 86400
    }
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@fintrace.io",
  "fullName": "New User",
  "password": "SecurePass123!"
}
```

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

## Transactions

### Create Transaction
```
POST /api/transactions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sourceAccountId": "ACC_001",
  "destinationAccountId": "ACC_002",
  "amount": 5000,
  "type": "transfer",
  "description": "Payment for services"
}
```

### Get Transactions
```
GET /api/transactions?page=1&pageSize=20&accountId=ACC_001&type=transfer&status=completed
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Get Transaction by ID
```
GET /api/transactions/{id}
Authorization: Bearer {accessToken}
```

### Flag Transaction
```
PATCH /api/transactions/{id}/flag
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "Suspected fraud"
}
```

### Import Transactions
```
POST /api/transactions/import
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "transactions": [
    {
      "sourceAccountId": "ACC_001",
      "destinationAccountId": "ACC_002",
      "amount": 1000,
      "type": "transfer"
    },
    ...
  ]
}
```

## ML Service

### Predict Fraud
```
POST /api/ml/predict
Content-Type: application/json

{
  "account_id": "ACC_001",
  "transaction_amount": 5000,
  "transaction_frequency": 2,
  "account_age": 365,
  "transfer_velocity": 1,
  "geographic_deviation": false,
  "device_mismatch": false,
  "balance_anomaly": false,
  "account_kyc_status": "verified"
}

Response:
{
  "account_id": "ACC_001",
  "fraud_probability": 0.15,
  "anomaly_score": 0.12,
  "risk_level": "low",
  "features": {...},
  "explanation": "No significant anomalies"
}
```

### Batch Predict
```
POST /api/ml/batch-predict
Content-Type: application/json

{
  "predictions": [...]
}
```

## Graph Operations

### Detect Circular Transfers
```
GET /api/graph/circular-transfers/{accountId}?maxHops=4
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "paths": [...]
  }
}
```

### Find Shortest Path
```
POST /api/graph/shortest-path
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sourceAccountId": "ACC_001",
  "destinationAccountId": "ACC_010"
}
```

### Get Account Relationships
```
GET /api/graph/relationships/{accountId}?depth=2
Authorization: Bearer {accessToken}
```

## Response Format

All API responses follow this format:

Success (2xx):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {...},
  "message": "Operation successful"
}
```

Error (4xx, 5xx):
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Error message describing what went wrong"
}
```

## Status Codes

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

All endpoints are rate-limited to 100 requests per minute per IP address.
Exceeded limit returns: 429 Too Many Requests

## Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer {accessToken}
```

Tokens expire after 24 hours. Use the refresh token to obtain a new access token.
