import { Request, Response } from 'express';
import { Keypair } from '@stellar/stellar-sdk';
import { paymentService } from '../../services/payment';
import { createLogger } from '../../utils/logger';

const logger = createLogger('payment-controller');

/**
 * Payment controller for handling payment-related API requests
 */
class PaymentController {
  /**
   * Deposit funds
   * @param req Request
   * @param res Response
   */
  public depositFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenAddress, tenantAddress, amount, secretKey } = req.body;
      
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
      
      if (!secretKey) {
        res.status(400).json({ error: { message: 'Secret key is required for authentication' } });
        return;
      }
      
      const tenantKeypair = Keypair.fromSecret(secretKey);
      
      const payment = await paymentService.depositFunds(
        tokenAddress,
        tenantAddress,
        amount,
        tenantKeypair
      );
      
      res.status(201).json({ payment });
    } catch (error) {
      logger.error('Error depositing funds:', error);
      res.status(500).json({
        error: {
          message: 'Failed to deposit funds',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Lock funds
   * @param req Request
   * @param res Response
   */
  public lockFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenAddress, tenantAddress, amount, secretKey } = req.body;
      
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
      
      if (!secretKey) {
        res.status(400).json({ error: { message: 'Secret key is required for authentication' } });
        return;
      }
      
      const tenantKeypair = Keypair.fromSecret(secretKey);
      
      const payment = await paymentService.lockFunds(
        tokenAddress,
        tenantAddress,
        amount,
        tenantKeypair
      );
      
      res.status(201).json({ payment });
    } catch (error) {
      logger.error('Error locking funds:', error);
      res.status(500).json({
        error: {
          message: 'Failed to lock funds',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Withdraw provider earnings
   * @param req Request
   * @param res Response
   */
  public withdrawProviderEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenAddress, providerAddress, secretKey } = req.body;
      
      if (!tokenAddress) {
        res.status(400).json({ error: { message: 'Token address is required' } });
        return;
      }
      
      if (!providerAddress) {
        res.status(400).json({ error: { message: 'Provider address is required' } });
        return;
      }
      
      if (!secretKey) {
        res.status(400).json({ error: { message: 'Secret key is required for authentication' } });
        return;
      }
      
      const providerKeypair = Keypair.fromSecret(secretKey);
      
      const payment = await paymentService.withdrawProviderEarnings(
        tokenAddress,
        providerAddress,
        providerKeypair
      );
      
      res.status(200).json({ payment });
    } catch (error) {
      logger.error('Error withdrawing provider earnings:', error);
      res.status(500).json({
        error: {
          message: 'Failed to withdraw earnings',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get tenant balance
   * @param req Request
   * @param res Response
   */
  public getTenantBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      const { tokenAddress } = req.query;
      
      if (!address) {
        res.status(400).json({ error: { message: 'Tenant address is required' } });
        return;
      }
      
      if (!tokenAddress) {
        res.status(400).json({ error: { message: 'Token address is required' } });
        return;
      }
      
      const balance = await paymentService.getTenantBalance(
        tokenAddress as string,
        address
      );
      
      res.status(200).json({ balance });
    } catch (error) {
      logger.error(`Error getting tenant balance for ${req.params.address}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get tenant balance',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get provider earnings
   * @param req Request
   * @param res Response
   */
  public getProviderEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { tokenAddress } = req.query;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!tokenAddress) {
        res.status(400).json({ error: { message: 'Token address is required' } });
        return;
      }
      
      const earnings = await paymentService.getProviderEarnings(
        parseInt(id),
        tokenAddress as string
      );
      
      res.status(200).json({ earnings });
    } catch (error) {
      logger.error(`Error getting provider earnings for ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get provider earnings',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get payment by ID
   * @param req Request
   * @param res Response
   */
  public getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Payment ID is required' } });
        return;
      }
      
      const payment = paymentService.getPayment(parseInt(id));
      
      if (!payment) {
        res.status(404).json({ error: { message: 'Payment not found' } });
        return;
      }
      
      res.status(200).json({ payment });
    } catch (error) {
      logger.error(`Error getting payment ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get payment',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * List all payments
   * @param req Request
   * @param res Response
   */
  public listPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = paymentService.listPayments();
      
      res.status(200).json({ payments });
    } catch (error) {
      logger.error('Error listing payments:', error);
      res.status(500).json({
        error: {
          message: 'Failed to list payments',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get payments for a lease
   * @param req Request
   * @param res Response
   */
  public getPaymentsForLease = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Lease ID is required' } });
        return;
      }
      
      const payments = paymentService.listPaymentsForLease(parseInt(id));
      
      res.status(200).json({ payments });
    } catch (error) {
      logger.error(`Error getting payments for lease ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get payments for lease',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get payments for a tenant
   * @param req Request
   * @param res Response
   */
  public getPaymentsForTenant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      
      if (!address) {
        res.status(400).json({ error: { message: 'Tenant address is required' } });
        return;
      }
      
      const payments = paymentService.listPaymentsForTenant(address);
      
      res.status(200).json({ payments });
    } catch (error) {
      logger.error(`Error getting payments for tenant ${req.params.address}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get payments for tenant',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get payments for a provider
   * @param req Request
   * @param res Response
   */
  public getPaymentsForProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address } = req.params;
      
      if (!address) {
        res.status(400).json({ error: { message: 'Provider address is required' } });
        return;
      }
      
      const payments = paymentService.listPaymentsForProvider(address);
      
      res.status(200).json({ payments });
    } catch (error) {
      logger.error(`Error getting payments for provider ${req.params.address}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get payments for provider',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

// Export singleton instance
export const paymentController = new PaymentController();