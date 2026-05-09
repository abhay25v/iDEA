// Neo4j Seeding Script

import 'dotenv/config';
import { connectNeo4j, getNeo4jSession, disconnectNeo4j } from '@config/neo4j';
import { sampleCustomers, sampleAccounts } from '../data/sample/transactions';
import logger from '@utils/logger';

async function seedNeo4j() {
  let driver;
  try {
    // Connect
    driver = await connectNeo4j();
    const session = getNeo4jSession();

    logger.info('Connected to Neo4j');

    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');
    logger.info('Cleared existing Neo4j data');

    // Create Customer nodes
    for (const customer of sampleCustomers) {
      await session.run(
        `
        CREATE (:Customer {
          customerId: $customerId,
          name: $name,
          kycStatus: $kycStatus,
          riskScore: $riskScore
        })
        `,
        {
          customerId: customer.id,
          name: customer.name,
          kycStatus: customer.kycStatus,
          riskScore: customer.riskScore,
        }
      );
    }
    logger.info('Customer nodes created');

    // Create Account nodes
    for (const account of sampleAccounts) {
      await session.run(
        `
        CREATE (:Account {
          accountId: $accountId,
          accountNumber: $accountNumber,
          accountType: $accountType,
          balance: $balance,
          riskScore: $riskScore,
          flagged: $flagged
        })
        `,
        {
          accountId: account.id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          riskScore: account.riskScore,
          flagged: account.status === 'flagged' || account.status === 'blocked',
        }
      );
    }
    logger.info('Account nodes created');

    // Create OWNS relationships
    for (const account of sampleAccounts) {
      await session.run(
        `
        MATCH (c:Customer {customerId: $customerId})
        MATCH (a:Account {accountId: $accountId})
        CREATE (c)-[:OWNS]->(a)
        `,
        {
          customerId: account.customerId,
          accountId: account.id,
        }
      );
    }
    logger.info('OWNS relationships created');

    // Create sample transfer relationships
    const transfers = [
      { source: 'ACC_001', dest: 'ACC_003', amount: 5000 },
      { source: 'ACC_005', dest: 'ACC_006', amount: 1500 },
      { source: 'ACC_006', dest: 'ACC_007', amount: 1400 },
      { source: 'ACC_007', dest: 'ACC_005', amount: 1350 },
      { source: 'ACC_009', dest: 'ACC_001', amount: 10000 },
    ];

    for (const transfer of transfers) {
      await session.run(
        `
        MATCH (src:Account {accountId: $sourceId})
        MATCH (dst:Account {accountId: $destId})
        CREATE (src)-[:TRANSFERRED_TO {amount: $amount, timestamp: datetime()}]->(dst)
        `,
        {
          sourceId: transfer.source,
          destId: transfer.dest,
          amount: transfer.amount,
        }
      );
    }
    logger.info('Transfer relationships created');

    // Create indexes
    await session.run('CREATE INDEX IF NOT EXISTS FOR (c:Customer) ON (c.customerId)');
    await session.run('CREATE INDEX IF NOT EXISTS FOR (a:Account) ON (a.accountId)');
    logger.info('Indexes created');

    await session.close();
    logger.info('Neo4j seeding completed successfully');
  } catch (error) {
    logger.error('Neo4j seeding error:', error);
    throw error;
  } finally {
    if (driver) {
      await disconnectNeo4j();
    }
    process.exit(0);
  }
}

seedNeo4j().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
