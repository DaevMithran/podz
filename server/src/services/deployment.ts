import { dockerClient } from '../utils/docker';
import { orderService } from './order';
import { providerService } from './provider';
import { DeploymentModel, LeaseModel } from '../types/models';
import { createLogger } from '../utils/logger';
import config from '../config';

const logger = createLogger('deployment-service');

/**
 * Deployment service for managing container deployments
 */
export class DeploymentService {
  private deployments: Map<number, DeploymentModel> = new Map();

  /**
   * Initialize the deployment service
   */
  constructor() {
    logger.info('Deployment service initialized');
    this.startMonitoringDeployments();
  }

  /**
   * Deploy a container for a lease
   * @param lease Lease model
   * @returns Deployment model
   */
  public async deployContainer(lease: LeaseModel): Promise<DeploymentModel> {
    try {
      logger.info(`Deploying container for lease ${lease.id}`);
      
      // Get the order for this lease
      const order = await orderService.getOrder(lease.orderId);
      
      // Get the provider for this lease
      const provider = await providerService.getProvider(lease.providerId);
      
      // Deploy container
      const containerId = await dockerClient.deployContainer(
        lease.id,
        lease.orderId,
        order.specification
      );
      
      // Create deployment model
      const deployment: DeploymentModel = {
        leaseId: lease.id,
        orderId: lease.orderId,
        providerId: lease.providerId,
        containerId,
        imageId: order.specification.image,
        status: 'running',
        healthStatus: 'unknown',
        healthChecks: {
          lastCheck: new Date(),
          consecutiveFailures: 0,
          logs: [
            {
              timestamp: new Date(),
              status: 'success',
              message: 'Container deployed',
            },
          ],
        },
        resources: {
          cpuUsage: 0,
          memoryUsage: 0,
          storageUsage: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store deployment
      this.deployments.set(lease.id, deployment);
      
      logger.info(`Container deployed for lease ${lease.id} with ID ${containerId}`);
      return deployment;
    } catch (error) {
      logger.error(`Failed to deploy container for lease ${lease.id}:`, error);
      throw new Error(`Container deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stop and remove a container for a lease
   * @param leaseId Lease ID
   * @returns Success boolean
   */
  public async stopContainer(leaseId: number): Promise<boolean> {
    try {
      logger.info(`Stopping container for lease ${leaseId}`);
      
      // Get deployment
      const deployment = this.deployments.get(leaseId);
      
      if (!deployment) {
        logger.warn(`No deployment found for lease ${leaseId}`);
        return false;
      }
      
      // Stop container
      await dockerClient.stopContainer(deployment.containerId);
      
      // Remove container
      await dockerClient.removeContainer(deployment.containerId);
      
      // Update deployment
      deployment.status = 'stopped';
      deployment.updatedAt = new Date();
      deployment.healthChecks.logs.push({
        timestamp: new Date(),
        status: 'success',
        message: 'Container stopped and removed',
      });
      
      // Store updated deployment
      this.deployments.set(leaseId, deployment);
      
      logger.info(`Container stopped and removed for lease ${leaseId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to stop container for lease ${leaseId}:`, error);
      throw new Error(`Container stop failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check container health
   * @param leaseId Lease ID
   * @returns Updated deployment model
   */
  public async checkContainerHealth(leaseId: number): Promise<DeploymentModel> {
    try {
      logger.info(`Checking container health for lease ${leaseId}`);
      
      // Get deployment
      let deployment = this.deployments.get(leaseId);
      
      if (!deployment) {
        logger.warn(`No deployment found for lease ${leaseId}`);
        throw new Error(`Deployment not found for lease ${leaseId}`);
      }
      
      // Check container health
      const healthStatus = await dockerClient.checkContainerHealth(deployment.containerId);
      
      // Update deployment based on health check
      if (healthStatus.status === 'running') {
        deployment.status = 'running';
        deployment.healthStatus = 'healthy';
        deployment.healthChecks.consecutiveFailures = 0;
        deployment.healthChecks.lastCheck = new Date();
        deployment.healthChecks.logs.push({
          timestamp: new Date(),
          status: 'success',
          message: 'Container is healthy',
        });
        
        // Update resource usage if available
        if (healthStatus.stats) {
          deployment.resources = {
            cpuUsage: healthStatus.stats.cpuPercentage,
            memoryUsage: Math.floor(healthStatus.stats.memoryUsage / (1024 * 1024)), // Convert to MB
            storageUsage: 0, // Storage usage not available from Docker stats
          };
        }
      } else if (healthStatus.status === 'stopped') {
        deployment.status = 'failed';
        deployment.healthStatus = 'unhealthy';
        deployment.healthChecks.consecutiveFailures += 1;
        deployment.healthChecks.lastCheck = new Date();
        deployment.healthChecks.logs.push({
          timestamp: new Date(),
          status: 'failure',
          message: `Container is stopped with exit code ${healthStatus.exitCode}`,
        });
      } else if (healthStatus.status === 'not_found') {
        deployment.status = 'failed';
        deployment.healthStatus = 'unhealthy';
        deployment.healthChecks.consecutiveFailures += 1;
        deployment.healthChecks.lastCheck = new Date();
        deployment.healthChecks.logs.push({
          timestamp: new Date(),
          status: 'failure',
          message: 'Container not found',
        });
      }
      
      deployment.updatedAt = new Date();
      
      // Store updated deployment
      this.deployments.set(leaseId, deployment);
      
      logger.info(`Container health checked for lease ${leaseId}: ${deployment.healthStatus}`);
      
      // Handle unhealthy containers based on threshold
      if (deployment.healthStatus === 'unhealthy' && 
          deployment.healthChecks.consecutiveFailures >= config.monitoring.failureThreshold) {
        await this.handleUnhealthyContainer(leaseId, deployment);
      }
      
      return deployment;
    } catch (error) {
      logger.error(`Failed to check container health for lease ${leaseId}:`, error);
      throw new Error(`Container health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle an unhealthy container
   * @param leaseId Lease ID
   * @param deployment Deployment model
   */
  private async handleUnhealthyContainer(leaseId: number, deployment: DeploymentModel): Promise<void> {
    try {
      logger.info(`Handling unhealthy container for lease ${leaseId}`);
      
      // Get container logs for diagnostic information
      const logs = await dockerClient.getContainerLogs(deployment.containerId);
      
      // Log the issue
      logger.warn(`Container for lease ${leaseId} is unhealthy. Container logs: ${logs}`);
      
      // Attempt to restart the container
      try {
        // Stop and remove the container
        await dockerClient.stopContainer(deployment.containerId);
        await dockerClient.removeContainer(deployment.containerId);
        
        // Get the order for this lease
        const order = await orderService.getOrder(deployment.orderId);
        
        // Deploy a new container
        const containerId = await dockerClient.deployContainer(
          deployment.leaseId,
          deployment.orderId,
          order.specification
        );
        
        // Update deployment
        deployment.containerId = containerId;
        deployment.status = 'running';
        deployment.healthStatus = 'unknown';
        deployment.healthChecks.consecutiveFailures = 0;
        deployment.healthChecks.lastCheck = new Date();
        deployment.healthChecks.logs.push({
          timestamp: new Date(),
          status: 'success',
          message: 'Container restarted after being unhealthy',
        });
        
        deployment.updatedAt = new Date();
        
        // Store updated deployment
        this.deployments.set(leaseId, deployment);
        
        logger.info(`Container restarted for lease ${leaseId} with new ID ${containerId}`);
      } catch (restartError) {
        logger.error(`Failed to restart container for lease ${leaseId}:`, restartError);
        
        // Update deployment
        deployment.status = 'failed';
        deployment.healthStatus = 'unhealthy';
        deployment.healthChecks.logs.push({
          timestamp: new Date(),
          status: 'failure',
          message: `Failed to restart container: ${restartError instanceof Error ? restartError.message : String(restartError)}`,
        });
        
        deployment.updatedAt = new Date();
        
        // Store updated deployment
        this.deployments.set(leaseId, deployment);
        
        // Penalize provider by locking their balance
        await this.penalizeProvider(deployment.providerId, deployment.orderId);
      }
    } catch (error) {
      logger.error(`Failed to handle unhealthy container for lease ${leaseId}:`, error);
    }
  }

  /**
   * Penalize a provider for an unhealthy deployment
   * @param providerId Provider ID
   * @param orderId Order ID to reference payment amount
   */
  private async penalizeProvider(providerId: number, orderId: number): Promise<void> {
    try {
      logger.info(`Penalizing provider ${providerId} for unhealthy deployment of order ${orderId}`);
      
      // In a real implementation, this would lock provider's stake or escrow balance
      // and potentially apply penalties according to the protocol rules
      
      // Get the provider
      const provider = await providerService.getProvider(providerId);
      
      // Get the order
      const order = await orderService.getOrder(orderId);
      
      // Log the penalty
      logger.warn(`Provider ${providerId} (${provider.address}) penalized for unhealthy deployment of order ${orderId}. Would lock ${order.maxPrice} from provider's balance.`);
      
      // In a real implementation with appropriate keypairs:
      // const adminKeypair = Keypair.fromSecret(config.soroban.signerSecretKey);
      // await escrowContract.lock(
      //   "TOKEN_ADDRESS",
      //   provider.address,
      //   order.maxPrice,
      //   adminKeypair
      // );
    } catch (error) {
      logger.error(`Failed to penalize provider ${providerId}:`, error);
    }
  }

  /**
   * Get deployment information
   * @param leaseId Lease ID
   * @returns Deployment model
   */
  public getDeployment(leaseId: number): DeploymentModel | undefined {
    return this.deployments.get(leaseId);
  }

  /**
   * List all deployments
   * @returns List of deployment models
   */
  public listDeployments(): DeploymentModel[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Start monitoring all deployments
   */
  private startMonitoringDeployments(): void {
    logger.info('Starting deployment monitoring');
    
    // Check container health periodically
    setInterval(async () => {
      logger.info('Running health check for all deployments');
      
      for (const [leaseId, deployment] of this.deployments.entries()) {
        if (deployment.status === 'running') {
          try {
            await this.checkContainerHealth(leaseId);
          } catch (error) {
            logger.error(`Error checking health for deployment ${leaseId}:`, error);
          }
        }
      }
    }, config.monitoring.healthCheckInterval);
  }

  /**
   * Get container logs
   * @param leaseId Lease ID
   * @returns Container logs
   */
  public async getContainerLogs(leaseId: number): Promise<string> {
    try {
      logger.info(`Getting logs for deployment ${leaseId}`);
      
      // Get deployment
      const deployment = this.deployments.get(leaseId);
      
      if (!deployment) {
        logger.warn(`No deployment found for lease ${leaseId}`);
        throw new Error(`Deployment not found for lease ${leaseId}`);
      }
      
      // Get container logs
      const logs = await dockerClient.getContainerLogs(deployment.containerId);
      
      logger.info(`Retrieved logs for deployment ${leaseId}`);
      return logs;
    } catch (error) {
      logger.error(`Failed to get logs for deployment ${leaseId}:`, error);
      throw new Error(`Get logs failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const deploymentService = new DeploymentService();