// Graph Controller

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import graphService from '@services/graph.service';
import logger from '@utils/logger';

export class GraphController {
  /**
   * Detect circular transfers
   */
  async detectCircularTransfers(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { maxHops = 4 } = req.query;

      const paths = await graphService.detectCircularTransfers(
        accountId as string,
        parseInt(maxHops as string)
      );

      sendResponse(res, 200, { paths });
    } catch (error) {
      logger.error('Error detecting circular transfers:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to detect circular transfers');
    }
  }

  /**
   * Detect rapid layering
   */
  async detectRapidLayering(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { maxHops = 5 } = req.query;

      const paths = await graphService.detectRapidLayering(
        accountId as string,
        parseInt(maxHops as string)
      );

      sendResponse(res, 200, { paths });
    } catch (error) {
      logger.error('Error detecting rapid layering:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to detect rapid layering');
    }
  }

  /**
   * Detect money mule networks
   */
  async detectMoneyMuleNetworks(req: Request, res: Response): Promise<void> {
    try {
      const { minConnections = 5 } = req.query;

      const clusters = await graphService.detectMoneyMuleNetworks(
        parseInt(minConnections as string)
      );

      sendResponse(res, 200, { clusters });
    } catch (error) {
      logger.error('Error detecting money mule networks:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to detect networks');
    }
  }

  /**
   * Find shortest path
   */
  async findShortestPath(req: Request, res: Response): Promise<void> {
    try {
      const { sourceAccountId, destinationAccountId } = req.body;

      if (!sourceAccountId || !destinationAccountId) {
        sendResponse(res, 400, undefined, undefined, 'Missing required parameters');
        return;
      }

      const path = await graphService.findShortestPath(sourceAccountId, destinationAccountId);

      if (!path) {
        sendResponse(res, 404, undefined, undefined, 'No path found between accounts');
        return;
      }

      sendResponse(res, 200, { path });
    } catch (error) {
      logger.error('Error finding shortest path:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to find path');
    }
  }

  /**
   * Get account relationships
   */
  async getAccountRelationships(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { depth = 2 } = req.query;

      const relationships = await graphService.getAccountRelationships(
        accountId as string,
        parseInt(depth as string)
      );

      sendResponse(res, 200, relationships);
    } catch (error) {
      logger.error('Error getting relationships:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to get relationships');
    }
  }

  /**
   * Get high-risk clusters
   */
  async getHighRiskClusters(req: Request, res: Response): Promise<void> {
    try {
      const { riskThreshold = 0.7 } = req.query;

      const clusters = await graphService.getHighRiskClusters(
        parseFloat(riskThreshold as string)
      );

      sendResponse(res, 200, { clusters });
    } catch (error) {
      logger.error('Error getting high-risk clusters:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to get clusters');
    }
  }
}

export default new GraphController();
