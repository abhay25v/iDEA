# Neo4j Graph Schema

## Node Types

### Customer
Represents banking customers

```cypher
(:Customer {
  customerId: string (unique),
  name: string,
  kycStatus: enum ['pending', 'verified', 'rejected'],
  riskScore: float (0-1),
  email: string,
  phone: string,
  dateOfBirth: date,
  nationality: string
})
```

### Account
Represents bank accounts

```cypher
(:Account {
  accountId: string (unique),
  accountNumber: string,
  accountType: enum ['savings', 'checking', 'credit', 'loan'],
  balance: float,
  status: enum ['active', 'inactive', 'blocked', 'flagged'],
  riskScore: float (0-1),
  createdAt: date,
  flagged: boolean
})
```

### Device
Represents devices used to access accounts

```cypher
(:Device {
  deviceId: string (unique),
  deviceType: string,
  ipAddress: string,
  location: string,
  lastSeenAt: date
})
```

### Branch
Represents bank branches

```cypher
(:Branch {
  branchId: string (unique),
  name: string,
  location: string,
  country: string
})
```

### Bank
Represents banks

```cypher
(:Bank {
  bankId: string (unique),
  name: string,
  countryCode: string
})
```

## Relationships

### OWNS
Customer owns an account

```cypher
(Customer)-[:OWNS]->(Account)
```

### TRANSFERRED_TO
Account transferred funds to another account

```cypher
(Account)-[:TRANSFERRED_TO {
  amount: float,
  timestamp: datetime,
  reference: string,
  count: integer
}]->(Account)
```

### RECEIVED_FROM
Reverse of TRANSFERRED_TO (derived)

```cypher
(Account)-[:RECEIVED_FROM]->(Account)
```

### DEPOSIT_FROM
Explicit deposit relationship

```cypher
(Account)-[:DEPOSIT_FROM {
  amount: float,
  timestamp: datetime
}]->(Account)
```

### WITHDRAWAL_TO
Explicit withdrawal relationship

```cypher
(Account)-[:WITHDRAWAL_TO {
  amount: float,
  timestamp: datetime
}]->(Account)
```

### USES_DEVICE
Customer uses a device

```cypher
(Customer)-[:USES_DEVICE]->(Device)
```

### ACCESSED_FROM
Account accessed from a device

```cypher
(Account)-[:ACCESSED_FROM]->(Device)
```

### LOCATED_AT
Account located at a branch

```cypher
(Account)-[:LOCATED_AT]->(Branch)
```

### IDENTIFIED_BY
Customer identified by a device

```cypher
(Customer)-[:IDENTIFIED_BY]->(Device)
```

### PART_OF
Branch is part of a bank

```cypher
(Branch)-[:PART_OF]->(Bank)
```

## Common Queries

### Detect Circular Transfers
Find money going in circles

```cypher
MATCH path = (a:Account)-[:TRANSFERRED_TO*2..5]->(a)
WHERE length(path) > 2
RETURN path
```

### Find Rapid Layering
Multiple hops in short time

```cypher
MATCH path = (start:Account)-[:TRANSFERRED_TO*2..5]->(end:Account)
WHERE start <> end
RETURN path, length(path) as hops
ORDER BY hops DESC
```

### Detect Money Mule Networks
Highly connected intermediate accounts

```cypher
MATCH (a:Account)
WITH a, size((a)-[:TRANSFERRED_TO|RECEIVED_FROM]->()) as degree
WHERE degree >= 10
MATCH (a)-[:TRANSFERRED_TO|RECEIVED_FROM]-(connected:Account)
WITH a, collect(connected) as network, degree
RETURN a.accountId, degree, size(network) as network_size
ORDER BY network_size DESC
```

### Account Relationship Network
Get inbound and outbound connections

```cypher
MATCH (src:Account)-[:TRANSFERRED_TO]->(target:Account {accountId: $accountId})
WITH collect(src) as inbound
MATCH (source:Account {accountId: $accountId})-[:TRANSFERRED_TO]->(dst:Account)
WITH inbound, collect(dst) as outbound
RETURN inbound, outbound
```

### High-Risk Connected Accounts
Find accounts connected to flagged accounts

```cypher
MATCH (flagged:Account {flagged: true})-[:TRANSFERRED_TO|RECEIVED_FROM]-(connected:Account)
WITH flagged, collect(connected {.*, flagged: flagged.riskScore > 0.7}) as cluster
RETURN flagged.accountId, size(cluster) as cluster_size
ORDER BY cluster_size DESC
```

### Shortest Path Analysis
Find shortest path between suspicious accounts

```cypher
MATCH path = shortestPath(
  (src:Account {accountId: $sourceId})-[:TRANSFERRED_TO*]->(dst:Account {accountId: $destId})
)
RETURN path
```

### Customer Account Hierarchy
View all accounts owned by a customer and their relationships

```cypher
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)
OPTIONAL MATCH (a)-[:TRANSFERRED_TO]-(related:Account)
RETURN c, collect(a) as accounts, collect(related) as related_accounts
```

## Indexes and Constraints

```cypher
// Create indexes for faster queries
CREATE INDEX IF NOT EXISTS FOR (c:Customer) ON (c.customerId);
CREATE INDEX IF NOT EXISTS FOR (a:Account) ON (a.accountId);
CREATE INDEX IF NOT EXISTS FOR (d:Device) ON (d.deviceId);
CREATE INDEX IF NOT EXISTS FOR (b:Branch) ON (b.branchId);

// Create uniqueness constraints
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Customer) REQUIRE c.customerId IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (a:Account) REQUIRE a.accountId IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (d:Device) REQUIRE d.deviceId IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (b:Branch) REQUIRE b.branchId IS UNIQUE;
```

## Performance Tips

1. Use EXPLAIN/PROFILE to understand query performance
2. Index heavily-traversed relationships
3. Use LIMIT to reduce result sets
4. Aggregate data before visualization
5. Use relationship projections for large graphs
6. Consider caching frequent query results
