// Neo4j Initialization Script

// Create indexes and constraints
CREATE INDEX IF NOT EXISTS FOR (c:Customer) ON (c.customerId);
CREATE INDEX IF NOT EXISTS FOR (a:Account) ON (a.accountId);
CREATE INDEX IF NOT EXISTS FOR (t:Transaction) ON (t.transactionId);
CREATE INDEX IF NOT EXISTS FOR (d:Device) ON (d.deviceId);
CREATE INDEX IF NOT EXISTS FOR (b:Branch) ON (b.branchId);

// Create constraints
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Customer) REQUIRE c.customerId IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (a:Account) REQUIRE a.accountId IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Transaction) REQUIRE t.transactionId IS UNIQUE;
