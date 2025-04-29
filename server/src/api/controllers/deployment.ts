import { Request, Response } from 'express';
import { deploymentService } from '../../services/deployment';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deployment-controller');

/**
 * Deployment controller for handling deployment-related API requests
 */
class DeploymentController {
  /**
   * Get a deployment by lease ID
   * @param req Request
   * @param res Response
   */
  public getDeployment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaseId } = req.params;
      
      if (!leaseId) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const deployment = deploymentService.getDeployment(parseInt(leaseId));
      
      if (!deployment) {
        res.status(404).json({ error: { message: 'Deployment not found' } });
        return;
      }
      
      res.status(200).json({ deployment });
    } catch (error) {
      logger.error(`Error getting deployment for lease ${req.params.leaseId}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get deployment',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * List all deployments
   * @param req Request
   * @param res Response
   */
  public listDeployments = async (req: Request, res: Response): Promise<void> => {
    try {
      const deployments = deploymentService.listDeployments();
      
      res.status(200).json({ deployments });
    } catch (error) {
      logger.error('Error listing deployments:', error);
      res.status(500).json({
        error: {
          message: 'Failed to list deployments',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Stop a deployment
   * @param req Request
   * @param res Response
   */
  public stopDeployment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leaseId } = req.params;
      
      if (!leaseId) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const success = await deploymentService.stopContainer(parseInt(leaseId));
      
      if (!success) {
        res.status(404).json({ error: { message: 'Deployment not found or already stopped' } });
        return;
      }
      
      res.status(200).json({ success });
    } catch (error) {
      logger.error(`Error stopping deployment for lease ${req.params.leaseId}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to stop deployment',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

// Export singleton instance
export const deploymentController = new DeploymentController();