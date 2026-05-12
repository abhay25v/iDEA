// Graph Routes

import { Router, Request, Response } from 'express';
import graphController from '@controllers/graph.controller';

const router: Router = Router();

router.get('/circular/:accountId', (req, res) => graphController.detectCircularTransfers(req, res));
router.get('/layering/:accountId', (req, res) => graphController.detectRapidLayering(req, res));
router.get('/money-mules', (req, res) => graphController.detectMoneyMuleNetworks(req, res));
router.get('/shortest-path', (req, res) => graphController.findShortestPath(req, res));
router.get('/relationships/:accountId', (req, res) => graphController.getAccountRelationships(req, res));

export default router;
