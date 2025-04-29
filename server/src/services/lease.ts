import { Keypair } from '@stellar/stellar-sdk';
import { LeaseModel } from '../types/models';
import { LeaseState } from '../types/contracts';
import { deploymentService } from './deployment';
import { paymentService } from './payment';
import { providerService } from './provider';
import { createLogger } from '../utils/logger';

const logger = createLogger('lease-service');

/**
 * Lease service for managing container leases
 */
export class LeaseService {
  private leases: Map<number, LeaseModel> = new Map();
  private leaseCounter: number = 0;

  /**
   * Initialize the lease service
   */
  constructor() {
    logger.info('Lease service initialized');
  }

  /**
   * Create a new lease
   * @param orderId Order ID
   * @param providerId Provider ID
   * @param startBlock Start block
   * @param endBlock End block
   * @param tenantAddress Tenant address
   * @returns Lease model
   */
  public async createLease(
    orderId: number,
    providerId: number,
    startBlock: number,
    endBlock: number,
    tenantAddress: string
  ): Promise<LeaseModel> {
    try {
      logger.info(`Creating lease for order ${orderId} with provider ${providerId}`);
      
      const provider = await providerService.getProvider(providerId);
      
      // Calculate estimated end time (assuming 5 second block time)
      const blocksRemaining = endBlock - startBlock;
      const secondsRemaining = blocksRemaining * 5;
      const estimatedEndTime = new Date();
      estimatedEndTime.setSeconds(estimatedEndTime.getSeconds() + secondsRemaining);
      
      // Create lease model
      const leaseId = ++this.leaseCounter;
      const lease: LeaseModel = {
        id: leaseId,
        orderId,
        providerId,
        startBlock,
        endBlock,
        estimatedEndTime,
        state: LeaseState.Active,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store lease
      this.leases.set(leaseId, lease);
      
      logger.info(`Lease created with ID ${leaseId}`);
      
      // Deploy container for this lease
      try {
        const deployment = await deploymentService.deployContainer(lease);
        
        // Update lease with container details
        lease.containerId = deployment.containerId;
        
        // Set container access URL based on provider's hostname/port
        if (provider.hostname) {
          // Assuming first port mapping is the main service port
          const firstPort = deployment.imageId.includes(':') ? 
            deployment.imageId.split(':')[1] : 
            '80';
            
          lease.accessUrl = `http://${provider.hostname}:${firstPort}`;
        }
        
        lease.updatedAt = new Date();
        this.leases.set(leaseId, lease);
        
        logger.info(`Container deployed for lease ${leaseId}`);
      } catch (deployError) {
        logger.error(`Failed to deploy container for lease ${leaseId}:`, deployError);
        
        // Set lease to problem state but don't fail the lease creation
        lease.state = LeaseState.Active; // Still active, but with deployment issues
        lease.updatedAt = new Date();
        this.leases.set(leaseId, lease);
      }
      
      return lease;
    } catch (error) {
      logger.error(`Failed to create lease for order ${orderId}:`, error);
      throw new Error(`Lease creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Complete a lease
   * @param leaseId Lease ID
   * @returns Updated lease model
   */
  public async completeLease(leaseId: number): Promise<LeaseModel> {
    try {
      logger.info(`Completing lease with ID ${leaseId}`);
      
      // Get lease
      const lease = this.leases.get(leaseId);
      
      if (!lease) {
        throw new Error(`Lease ${leaseId} not found`);
      }
      
      // Stop container
      await deploymentService.stopContainer(leaseId);
      
      // Update lease
      lease.state = LeaseState.Completed;
      lease.updatedAt = new Date();
      
      // Store updated lease
      this.leases.set(leaseId, lease);
      
      logger.info(`Lease ${leaseId} completed`);
      return lease;
    } catch (error) {
      logger.error(`Failed to complete lease ${leaseId}:`, error);
      throw new Error(`Complete lease failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel a lease
   * @param leaseId Lease ID
   * @returns Updated lease model
   */
  public async cancelLease(leaseId: number): Promise<LeaseModel> {
    try {
      logger.info(`Canceling lease with ID ${leaseId}`);
      
      // Get lease
      const lease = this.leases.get(leaseId);
      
      if (!lease) {
        throw new Error(`Lease ${leaseId} not found`);
      }
      
      // Stop container
      await deploymentService.stopContainer(leaseId);
      
      // Update lease
      lease.state = LeaseState.Canceled;
      lease.updatedAt = new Date();
      
      // Store updated lease
      this.leases.set(leaseId, lease);
      
      logger.info(`Lease ${leaseId} canceled`);
      return lease;
    } catch (error) {
      logger.error(`Failed to cancel lease ${leaseId}:`, error);
      throw new Error(`Cancel lease failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process payment for a lease
   * @param leaseId Lease ID
   * @param tokenAddress Token address
   * @param tenantAddress Tenant address
   * @param amount Amount to pay
   * @param adminKeypair Admin keypair for authentication
   * @returns Success boolean
   */
  public async processPayment(
    leaseId: number,
    tokenAddress: string,
    tenantAddress: string,
    amount: string,
    adminKeypair: Keypair
  ): Promise<boolean> {
    try {
      logger.info(`Processing payment for lease ${leaseId}`);
      
      // Get lease
      const lease = this.leases.get(leaseId);
      
      if (!lease) {
        throw new Error(`Lease ${leaseId} not found`);
      }
      
      // Get provider
      const provider = await providerService.getProvider(lease.providerId);
      
      // Transfer funds from tenant to provider
      await paymentService.transferFunds(
        tokenAddress,
        tenantAddress,
        provider.address,
        lease.providerId,
        amount,
        leaseId,
        adminKeypair
      );
      
      logger.info(`Payment processed for lease ${leaseId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to process payment for lease ${leaseId}:`, error);
      throw new Error(`Process payment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get lease by ID
   * @param leaseId Lease ID
   * @returns Lease model
   */
  public getLease(leaseId: number): LeaseModel | undefined {
    return this.leases.get(leaseId);
  }

  /**
   * List all leases
   * @returns List of lease models
   */
  public listLeases(): LeaseModel[] {
    return Array.from(this.leases.values());
  }

  /**
   * List leases for a provider
   * @param providerId Provider ID
   * @returns List of lease models
   */
  public listLeasesForProvider(providerId: number): LeaseModel[] {
    return Array.from(this.leases.values()).filter(lease => lease.providerId === providerId);
  }

  /**
   * List leases for an order
   * @param orderId Order ID
   * @returns List of lease models
   */
  public listLeasesForOrder(orderId: number): LeaseModel[] {
    return Array.from(this.leases.values()).filter(lease => lease.orderId === orderId);
  }

  /**
   * Check container health for a lease
   * @param leaseId Lease ID
   * @returns Health status
   */
  public async checkLeaseHealth(leaseId: number): Promise<{
    isHealthy: boolean;
    status: string;
    details: any;
  }> {
    try {
      logger.info(`Checking health for lease ${leaseId}`);
      
      // Get lease
      const lease = this.leases.get(leaseId);
      
      if (!lease) {
        throw new Error(`Lease ${leaseId} not found`);
      }
      
      // Check deployment health
      const deployment = await deploymentService.checkContainerHealth(leaseId);
      
      const isHealthy = deployment.healthStatus === 'healthy';
      
      logger.info(`Health check for lease ${leaseId}: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      
      return {
        isHealthy,
        status: deployment.status,
        details: {
          healthStatus: deployment.healthStatus,
          lastCheck: deployment.healthChecks.lastCheck,
          consecutiveFailures: deployment.healthChecks.consecutiveFailures,
          resources: deployment.resources,
        },
      };
    } catch (error) {
      logger.error(`Failed to check health for lease ${leaseId}:`, error);
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get container logs for a lease
   * @param leaseId Lease ID
   * @returns Container logs
   */
  public async getLeaseLogs(leaseId: number): Promise<string> {
    try {
      logger.info(`Getting logs for lease ${leaseId}`);
      
      // Get lease
      const lease = this.leases.get(leaseId);
      
      if (!lease) {
        throw new Error(`Lease ${leaseId} not found`);
      }
      
      // Get container logs
      const logs = await deploymentService.getContainerLogs(leaseId);
      
      logger.info(`Retrieved logs for lease ${leaseId}`);
      return logs;
    } catch (error) {
      logger.error(`Failed to get logs for lease ${leaseId}:`, error);
      throw new Error(`Get logs failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const leaseService = new LeaseService();