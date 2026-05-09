// Neo4j Graph Service for Fraud Detection

import { getNeo4jSession } from '@config/neo4j';
import { GraphNode, GraphEdge, GraphPath, GraphCluster } from '@shared/types';
import logger from '@utils/logger';

export class GraphService {
  /**
   * Detect circular transfers
   */
  async detectCircularTransfers(
    accountId: string,
    maxHops: number = 4
  ): Promise<GraphPath[]> {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        `
        MATCH path = (a:Account {accountId: $accountId})-[:TRANSFERRED_TO*2..${maxHops}]->(a)
        WHERE length(path) > 2
        RETURN path
        `,
        { accountId }
      );

      const paths: GraphPath[] = [];
      for (const record of result.records) {
        const path = record.get('path');
        paths.push(this.convertPathToGraphPath(path));
      }

      return paths;
    } catch (error) {
      logger.error('Error detecting circular transfers:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Detect rapid layering
   */
  async detectRapidLayering(accountId: string, maxHops: number = 5): Promise<GraphPath[]> {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        `
        MATCH path = (a:Account {accountId: $accountId})-[:TRANSFERRED_TO*2..${maxHops}]->(b:Account)
        WHERE a <> b
        RETURN path, length(path) as hopCount
        ORDER BY hopCount DESC
        LIMIT 10
        `,
        { accountId }
      );

      const paths: GraphPath[] = [];
      for (const record of result.records) {
        const path = record.get('path');
        paths.push(this.convertPathToGraphPath(path));
      }

      return paths;
    } catch (error) {
      logger.error('Error detecting rapid layering:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Find money mule networks - highly connected accounts
   */
  async detectMoneyMuleNetworks(minConnections: number = 5): Promise<GraphCluster[]> {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        `
        MATCH (a:Account)
        WITH a, size((a)-[:TRANSFERRED_TO|RECEIVED_FROM]->()) as degree
        WHERE degree >= $minConnections
        MATCH (a)-[:TRANSFERRED_TO|RECEIVED_FROM]-(connected:Account)
        WITH a, collect(connected) as cluster, degree
        WHERE size(cluster) >= $minConnections
        RETURN a.accountId as centerId, cluster
        LIMIT 20
        `,
        { minConnections }
      );

      const clusters: GraphCluster[] = [];
      for (const record of result.records) {
        // Simplified cluster structure
        clusters.push({
          id: record.get('centerId'),
          nodes: [],
          edges: [],
          density: 0,
          suspiciousCount: 0,
        });
      }

      return clusters;
    } catch (error) {
      logger.error('Error detecting money mule networks:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get shortest path between two accounts
   */
  async findShortestPath(
    sourceAccountId: string,
    destinationAccountId: string
  ): Promise<GraphPath | null> {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        `
        MATCH path = shortestPath((a:Account {accountId: $sourceId})-[:TRANSFERRED_TO*]->(b:Account {accountId: $destId}))
        RETURN path
        `,
        { sourceId: sourceAccountId, destId: destinationAccountId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const path = result.records[0].get('path');
      return this.convertPathToGraphPath(path);
    } catch (error) {
      logger.error('Error finding shortest path:', error);
      return null;
    } finally {
      await session.close();
    }
  }

  /**
   * Analyze account relationships
   */
  async getAccountRelationships(accountId: string, depth: number = 2): Promise<{
    inbound: GraphNode[];
    outbound: GraphNode[];
  }> {
    const session = getNeo4jSession();
    try {
      // Get inbound relationships
      const inboundResult = await session.run(
        `
        MATCH (source:Account)-[:TRANSFERRED_TO*1..${depth}]->(target:Account {accountId: $accountId})
        RETURN DISTINCT source.accountId as accountId, source.riskScore as riskScore
        `,
        { accountId }
      );

      const inbound: GraphNode[] = inboundResult.records.map((record) => ({
        id: record.get('accountId'),
        label: record.get('accountId'),
        type: 'account',
        properties: { riskScore: record.get('riskScore') },
      }));

      // Get outbound relationships
      const outboundResult = await session.run(
        `
        MATCH (source:Account {accountId: $accountId})-[:TRANSFERRED_TO*1..${depth}]->(target:Account)
        RETURN DISTINCT target.accountId as accountId, target.riskScore as riskScore
        `,
        { accountId }
      );

      const outbound: GraphNode[] = outboundResult.records.map((record) => ({
        id: record.get('accountId'),
        label: record.get('accountId'),
        type: 'account',
        properties: { riskScore: record.get('riskScore') },
      }));

      return { inbound, outbound };
    } catch (error) {
      logger.error('Error analyzing relationships:', error);
      return { inbound: [], outbound: [] };
    } finally {
      await session.close();
    }
  }

  /**
   * Get high-risk connected clusters
   */
  async getHighRiskClusters(riskThreshold: number = 0.7): Promise<GraphCluster[]> {
    const session = getNeo4jSession();
    try {
      const result = await session.run(
        `
        MATCH (a:Account {flagged: true})
        MATCH (a)-[:TRANSFERRED_TO|RECEIVED_FROM]-(connected:Account)
        WITH a, collect(connected {.*}) as connectedAccounts
        RETURN a.accountId as clusterId, a.riskScore as riskScore, connectedAccounts
        LIMIT 10
        `
      );

      const clusters: GraphCluster[] = result.records.map((record) => ({
        id: record.get('clusterId'),
        nodes: [],
        edges: [],
        density: 0,
        suspiciousCount: 1,
      }));

      return clusters;
    } catch (error) {
      logger.error('Error getting high-risk clusters:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Convert Neo4j path to GraphPath
   */
  private convertPathToGraphPath(path: any): GraphPath {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Extract nodes
    for (let i = 0; i < path.length; i++) {
      const segment = path.segments[i];
      const sourceNode = segment.start;
      const targetNode = segment.end;
      const relationship = segment.relationship;

      // Add source node if not exists
      if (!nodes.find((n) => n.id === sourceNode.identity.toString())) {
        nodes.push({
          id: sourceNode.identity.toString(),
          label: sourceNode.properties.accountId || sourceNode.properties.customerId,
          type: sourceNode.labels[0]?.toLowerCase() || 'unknown',
          properties: sourceNode.properties,
        });
      }

      // Add target node if not exists
      if (!nodes.find((n) => n.id === targetNode.identity.toString())) {
        nodes.push({
          id: targetNode.identity.toString(),
          label: targetNode.properties.accountId || targetNode.properties.customerId,
          type: targetNode.labels[0]?.toLowerCase() || 'unknown',
          properties: targetNode.properties,
        });
      }

      // Add edge
      edges.push({
        id: relationship.identity.toString(),
        source: sourceNode.identity.toString(),
        target: targetNode.identity.toString(),
        type: relationship.type,
        properties: relationship.properties,
      });
    }

    return { nodes, edges };
  }
}

export default new GraphService();
