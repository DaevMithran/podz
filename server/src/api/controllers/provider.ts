import { Request, Response } from 'express';
import { Keypair } from '@stellar/stellar-sdk';
import { providerService } from '../../services/provider';
import { TrustLevel, ProviderStatus } from '../../types/contracts';
import { ResourceSpecification } from '../../types/models';
import { createLogger } from '../../utils/logger';
import config from '../../config';

const logger = createLogger('provider-controller');

/**
 * Provider controller for handling provider-related API requests
 */
class ProviderController {
  /**
   * Register a new provider
   * @param req Request
   * @param res Response
   */
  public registerProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { resources, hostname, port } = req.body;
      
      if (!resources) {
        res.status(400).json({ error: { message: 'Resources are required' } });
        return;
      }
      
      const provider = await providerService.registerProvider(
        resources as ResourceSpecification,
        hostname,
        port
      );
      
      res.status(201).json({ provider });
    } catch (error) {
      logger.error('Error registering provider:', error);
      res.status(500).json({
        error: {
          message: 'Failed to register provider',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get a provider by ID
   * @param req Request
   * @param res Response
   */
  public getProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      const provider = await providerService.getProvider(parseInt(id));
      
      res.status(200).json({ provider });
    } catch (error) {
      logger.error(`Error getting provider ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get provider',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * List all providers
   * @param req Request
   * @param res Response
   */
  public listProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = await providerService.listProviders();
      
      res.status(200).json({ providers });
    } catch (error) {
      logger.error('Error listing providers:', error);
      res.status(500).json({
        error: {
          message: 'Failed to list providers',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Update provider status
   * @param req Request
   * @param res Response
   */
  public updateProviderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!status) {
        res.status(400).json({ error: { message: 'Status is required' } });
        return;
      }
      
      if (!Object.values(ProviderStatus).includes(status as ProviderStatus)) {
        res.status(400).json({ error: { message: 'Invalid status' } });
        return;
      }

      
      const provider = await providerService.updateProviderStatus(
        parseInt(id),
        status as ProviderStatus,
      );
      
      res.status(200).json({ provider });
    } catch (error) {
      logger.error(`Error updating provider ${req.params.id} status:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to update provider status',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Update provider trust level
   * @param req Request
   * @param res Response
   */
  public updateProviderTrustLevel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { trustLevel } = req.body;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!trustLevel) {
        res.status(400).json({ error: { message: 'Trust level is required' } });
        return;
      }
      
      if (!Object.values(TrustLevel).includes(trustLevel as TrustLevel)) {
        res.status(400).json({ error: { message: 'Invalid trust level' } });
        return;
      }
      
      // Use admin keypair for trust level changes
      const adminKeypair = Keypair.fromSecret(config.soroban.signerSecretKey);
      
      const provider = await providerService.updateProviderTrustLevel(
        parseInt(id),
        trustLevel as TrustLevel,
        adminKeypair
      );
      
      res.status(200).json({ provider });
    } catch (error) {
      logger.error(`Error updating provider ${req.params.id} trust level:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to update provider trust level',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Update provider resources
   * @param req Request
   * @param res Response
   */
  public updateProviderResources = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { resources } = req.body;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!resources) {
        res.status(400).json({ error: { message: 'Resources are required' } });
        return;
      }
      
      const provider = await providerService.updateProviderResources(
        parseInt(id),
        resources as ResourceSpecification
      );
      
      res.status(200).json({ provider });
    } catch (error) {
      logger.error(`Error updating provider ${req.params.id} resources:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to update provider resources',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

// Export singleton instance
export const providerController = new ProviderController();