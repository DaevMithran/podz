import { Keypair } from '@stellar/stellar-sdk';
import { providerRegistryContract } from '../contracts/provider-registry';
import { Provider, ProviderStatus, TrustLevel } from '../types/contracts';
import { ProviderModel, ResourceSpecification } from '../types/models';
import { createLogger } from '../utils/logger';
import { sorobanClient } from '../contracts/client';

const logger = createLogger('provider-service');

/**
 * Provider service for managing provider operations
 */
export class ProviderService {
  /**
   * Register a new provider
   * @param address Provider address
   * @param resources Available resources
   * @param hostname Server hostname/IP
   * @param port Server port
   * @returns Provider model
   */
  public async registerProvider(
    resources: ResourceSpecification,
    hostname?: string,
    port?: number
  ): Promise<ProviderModel> {
    try {
      const callerAddress = await sorobanClient.getAddress()
      logger.info(`Registering provider with address ${callerAddress}`);
      
      // Add provider to registry
      const providerId = await providerRegistryContract.addProvider(callerAddress);
      
      // Get provider details
      const provider = await providerRegistryContract.getProvider(providerId);
      
      // Create provider model
      const providerModel: ProviderModel = {
        id: providerId,
        address: provider.address,
        trustLevel: provider.trust_level,
        status: provider.status,
        hostname,
        port,
        availableResources: resources,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      logger.info(`Provider registered with ID ${providerId}`);
      return providerModel;
    } catch (error) {
      logger.error(`Failed to register provider:`, error);
      throw new Error(`Provider registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update provider status
   * @param providerId Provider ID
   * @param status New status
   * @param providerKeypair Provider keypair for authentication
   * @returns Updated provider
   */
  public async updateProviderStatus(
    providerId: number,
    status: ProviderStatus,
  ): Promise<Provider> {
    try {
      logger.info(`Updating status for provider ${providerId} to ${status}`);
      
      // Update status
      await providerRegistryContract.setProviderStatus(
        providerId,
        status
      );
      
      // Get updated provider
      const provider = await providerRegistryContract.getProvider(providerId);
      
      logger.info(`Status updated for provider ${providerId}`);
      return provider;
    } catch (error) {
      logger.error(`Failed to update status for provider ${providerId}:`, error);
      throw new Error(`Update provider status failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update provider trust level
   * @param providerId Provider ID
   * @param trustLevel New trust level
   * @param adminKeypair Admin keypair for authentication
   * @returns Updated provider
   */
  public async updateProviderTrustLevel(
    providerId: number,
    trustLevel: TrustLevel,
    adminKeypair: Keypair
  ): Promise<Provider> {
    try {
      logger.info(`Updating trust level for provider ${providerId} to ${trustLevel}`);
      
      // Update trust level
      await providerRegistryContract.setTrustLevel(
        providerId,
        trustLevel
      );
      
      // Get updated provider
      const provider = await providerRegistryContract.getProvider(providerId);
      
      logger.info(`Trust level updated for provider ${providerId}`);
      return provider;
    } catch (error) {
      logger.error(`Failed to update trust level for provider ${providerId}:`, error);
      throw new Error(`Update provider trust level failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get provider by ID
   * @param providerId Provider ID
   * @returns Provider model
   */
  public async getProvider(providerId: number): Promise<ProviderModel> {
    try {
      logger.info(`Getting provider with ID ${providerId}`);
      
      // Get provider from registry
      const provider = await providerRegistryContract.getProvider(providerId);
      
      // Create provider model
      const providerModel: ProviderModel = {
        id: providerId,
        address: provider.address,
        trustLevel: provider.trust_level,
        status: provider.status,
        // Note: Additional details like hostname, port, and resources would need to be
        // retrieved from a database in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      logger.info(`Provider ${providerId} retrieved`);
      return providerModel;
    } catch (error) {
      logger.error(`Failed to get provider with ID ${providerId}:`, error);
      throw new Error(`Get provider failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get provider by address
   * @param address Provider address
   * @returns Provider model
   */
  public async getProviderByAddress(address: string): Promise<ProviderModel> {
    try {
      logger.info(`Getting provider with address ${address}`);
      
      // Get provider from registry
      const [providerId, provider] = await providerRegistryContract.getProviderByAddress(address);
      
      // Create provider model
      const providerModel: ProviderModel = {
        id: providerId,
        address: provider.address,
        trustLevel: provider.trust_level,
        status: provider.status,
        // Note: Additional details like hostname, port, and resources would need to be
        // retrieved from a database in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      logger.info(`Provider with address ${address} retrieved`);
      return providerModel;
    } catch (error) {
      logger.error(`Failed to get provider with address ${address}:`, error);
      throw new Error(`Get provider by address failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all providers
   * @returns List of provider models
   */
  public async listProviders(): Promise<ProviderModel[]> {
    try {
      logger.info('Listing all providers');
      
      // Get providers from registry
      const providers = await providerRegistryContract.listProviders();
      
      // Create provider models
      const providerModels: ProviderModel[] = providers.map((provider, index) => ({
        id: index + 1, // This is an approximation; in a real system, you'd map the actual IDs
        address: provider.address,
        trustLevel: provider.trust_level,
        status: provider.status,
        // Note: Additional details like hostname, port, and resources would need to be
        // retrieved from a database in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      logger.info(`Retrieved ${providerModels.length} providers`);
      return providerModels;
    } catch (error) {
      logger.error('Failed to list providers:', error);
      throw new Error(`List providers failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update provider resources
   * @param providerId Provider ID
   * @param resources New resource specification
   * @returns Updated provider model
   */
  public async updateProviderResources(
    providerId: number,
    resources: ResourceSpecification
  ): Promise<ProviderModel> {
    try {
      logger.info(`Updating resources for provider ${providerId}`);
      
      // Get current provider
      const provider = await this.getProvider(providerId);
      
      // Update resources
      provider.availableResources = resources;
      provider.updatedAt = new Date();
      
      // Note: In a real implementation, you would update the resources in a database
      
      logger.info(`Resources updated for provider ${providerId}`);
      return provider;
    } catch (error) {
      logger.error(`Failed to update resources for provider ${providerId}:`, error);
      throw new Error(`Update provider resources failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const providerService = new ProviderService();