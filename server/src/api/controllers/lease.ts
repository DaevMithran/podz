import { Request, Response } from 'express';
import { Keypair } from '@stellar/stellar-sdk';
import { leaseService } from '../../services/lease';
import { createLogger } from '../../utils/logger';
import config from '../../config';

const logger = createLogger('lease-controller');

/**
 * Lease controller for handling lease-related API requests
 */
class LeaseController {
  /**
   * Create a new lease
   * @param req Request
   * @param res Response
   */
  public createLease = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        orderId,
        providerId,
        startBlock,
        endBlock,
        tenantAddress,
      } = req.body;
      
      if (!orderId) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      if (!providerId) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!startBlock) {
        res.status(400).json({ error: { message: 'Start block is required' } });
        return;
      }
      
      if (!endBlock) {
        res.status(400).json({ error: { message: 'End block is required' } });
        return;
      }
      
      if (!tenantAddress) {
        res.status(400).json({ error: { message: 'Tenant address is required' } });
        return;
      }
      
      const lease = await leaseService.createLease(
        orderId,
        providerId,
        startBlock,
        endBlock,
        tenantAddress
      );
      
      res.status(201).json({ lease });
    } catch (error) {
      logger.error('Error creating lease:', error);
      res.status(500).json({
        error: {
          message: 'Failed to create lease',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get a lease by ID
   * @param req Request
   * @param res Response
   */
  public getLease = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const lease = leaseService.getLease(parseInt(id));
      
      if (!lease) {
        res.status(404).json({ error: { message: 'Lease not found' } });
        return;
      }
      
      res.status(200).json({ lease });
    } catch (error) {
      logger.error(`Error getting lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get lease',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * List all leases
   * @param req Request
   * @param res Response
   */
  public listLeases = async (req: Request, res: Response): Promise<void> => {
    try {
      const leases = leaseService.listLeases();
      
      res.status(200).json({ leases });
    } catch (error) {
      logger.error('Error listing leases:', error);
      res.status(500).json({
        error: {
          message: 'Failed to list leases',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Complete a lease
   * @param req Request
   * @param res Response
   */
  public completeLease = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const lease = await leaseService.completeLease(parseInt(id));
      
      res.status(200).json({ lease });
    } catch (error) {
      logger.error(`Error completing lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to complete lease',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Cancel a lease
   * @param req Request
   * @param res Response
   */
  public cancelLease = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const lease = await leaseService.cancelLease(parseInt(id));
      
      res.status(200).json({ lease });
    } catch (error) {
      logger.error(`Error canceling lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to cancel lease',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Process payment for a lease
   * @param req Request
   * @param res Response
   */
  public processPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { tokenAddress, tenantAddress, amount } = req.body;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      if (!tokenAddress) {
        res.status(400).json({ error: { message: 'Token address is required' } });
        return;
      }
      
      if (!tenantAddress) {
        res.status(400).json({ error: { message: 'Tenant address is required' } });
        return;
      }
      
      if (!amount) {
        res.status(400).json({ error: { message: 'Amount is required' } });
        return;
      }
      
      // Use admin keypair for payment processing
      const adminKeypair = Keypair.fromSecret(config.soroban.signerSecretKey);
      
      const success = await leaseService.processPayment(
        parseInt(id),
        tokenAddress,
        tenantAddress,
        amount,
        adminKeypair
      );
      
      res.status(200).json({ success });
    } catch (error) {
      logger.error(`Error processing payment for lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to process payment',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Check lease health
   * @param req Request
   * @param res Response
   */
  public checkLeaseHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const health = await leaseService.checkLeaseHealth(parseInt(id));
      
      res.status(200).json({ health });
    } catch (error) {
      logger.error(`Error checking health for lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to check lease health',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get lease logs
   * @param req Request
   * @param res Response
   */
  public getLeaseLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const logs = await leaseService.getLeaseLogs(parseInt(id));
      
      res.status(200).json({ logs });
    } catch (error) {
      logger.error(`Error getting logs for lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get lease logs',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get leases for a provider
   * @param req Request
   * @param res Response
   */
  public getLeasesForProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      const leases = leaseService.listLeasesForProvider(parseInt(id));
      
      res.status(200).json({ leases });
    } catch (error) {
      logger.error(`Error getting leases for provider ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get leases for provider',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get leases for an order
   * @param req Request
   * @param res Response
   */
  public getLeasesForOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      const leases = leaseService.listLeasesForOrder(parseInt(id));
      
      res.status(200).json({ leases });
    } catch (error) {
      logger.error(`Error getting leases for order ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get leases for order',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

// Export singleton instance
export const leaseController = new LeaseController();