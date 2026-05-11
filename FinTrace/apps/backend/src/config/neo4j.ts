// Neo4j Connection
import neo4j, { Driver, Session } from 'neo4j-driver';
import config from '@config';
import logger from '@utils/logger';

let driver: Driver | null = null;

export async function connectNeo4j(): Promise<Driver> {
  if (driver) {
    logger.info('Neo4j already connected');
    return driver;
  }

  try {
    driver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
      {
        maxConnectionPoolSize: 50,
      }
    );

    // Verify connection
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();

    logger.info('Neo4j connected successfully');
    return driver;
  } catch (error) {
    logger.error('Neo4j connection failed:', error);
    throw error;
  }
}

export function getNeo4jDriver(): Driver {
  if (!driver) {
    throw new Error('Neo4j driver not initialized');
  }
  return driver;
}

export function getNeo4jSession(): Session {
  if (!driver) {
    throw new Error('Neo4j driver not initialized');
  }
  return driver.session();
}

export async function disconnectNeo4j(): Promise<void> {
  if (driver) {
    try {
      await driver.close();
      driver = null;
      logger.info('Neo4j disconnected');
    } catch (error) {
      logger.error('Neo4j disconnection error:', error);
      throw error;
    }
  }
}

export default { connectNeo4j, getNeo4jDriver, getNeo4jSession, disconnectNeo4j };
