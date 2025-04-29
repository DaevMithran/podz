import { Keypair, nativeToScVal } from '@stellar/stellar-sdk';
import { sorobanClient } from './client';
import config from '../config';
import { Provider, TrustLevel, ProviderStatus } from '../types/contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('provider-registry-contract');

/**
 * Provider Registry Contract client for interacting with the provider registry contract
 */
export class ProviderRegistryContract {
  private contractId: string;

  /**
   * Initialize the provider registry contract client
   */
  constructor() {
    this.contractId = config.soroban.providerRegistryId;
    
    if (!this.contractId) {
      logger.error('Provider registry contract ID not set in configuration');
      throw new Error('Provider registry contract ID not set in configuration');
    }
    
    logger.info('Provider registry contract client initialized');
  }

  /**
   * Add a provider to the registry
   * @param address Provider address
   * @returns Provider ID
   */
  public async addProvider(address: string): Promise<number> {
    try {
      logger.info(`Adding provider with address ${address}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<number>(
        contract,
        'add_provider',
        nativeToScVal(address)
      );
      
      logger.info(`Provider added with ID ${result}`);
      return result;
    } catch (error) {
      logger.error(`Failed to add provider with address ${address}:`, error);
      throw new Error(`Add provider failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set the trust level for a provider
   * @param providerId Provider ID
   * @param trustLevel Trust level
   */
  public async setTrustLevel(
    providerId: number,
    trustLevel: TrustLevel
  ): Promise<void> {
    try {
      logger.info(`Setting trust level ${trustLevel} for provider ${providerId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'set_trust_level',
        providerId,
        trustLevel
      );
      
      logger.info(`Trust level set for provider ${providerId}`);
    } catch (error) {
      logger.error(`Failed to set trust level for provider ${providerId}:`, error);
      throw new Error(`Set trust level failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set the status for a provider
   * @param providerSenderKeypair Provider sender keypair for authentication
   * @param providerId Provider ID
   * @param status Provider status
   */
  public async setProviderStatus(
    providerId: number,
    status: ProviderStatus
  ): Promise<void> {
    try {
      logger.info(`Setting status ${status} for provider ${providerId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'set_provider_status',
        providerId,
        status
      );
      
      logger.info(`Status set for provider ${providerId}`);
    } catch (error) {
      logger.error(`Failed to set status for provider ${providerId}:`, error);
      throw new Error(`Set provider status failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a provider by ID
   * @param providerId Provider ID
   * @returns Provider
   */
  public async getProvider(providerId: number): Promise<Provider> {
    try {
      logger.info(`Getting provider with ID ${providerId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<Provider>(
        contract,
        'get_provider',
        nativeToScVal(providerId, { type: "u64"})
      );
      
      logger.info(`Provider retrieved with ID ${providerId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to get provider with ID ${providerId}:`, error);
      throw new Error(`Get provider failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a provider by address
   * @param address Provider address
   * @returns Provider ID and provider
   */
  public async getProviderByAddress(address: string): Promise<[number, Provider]> {
    try {
      logger.info(`Getting provider with address ${address}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<[number, Provider]>(
        contract,
        'get_provider_by_address',
        address
      );
      
      logger.info(`Provider retrieved with address ${address}`);
      return result;
    } catch (error) {
      logger.error(`Failed to get provider with address ${address}:`, error);
      throw new Error(`Get provider by address failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all providers
   * @returns List of providers
   */
  public async listProviders(): Promise<Provider[]> {
    try {
      logger.info('Listing all providers');
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<Provider[]>(
        contract,
        'list_provider'
      );
      
      logger.info(`Retrieved ${result.length} providers`);
      return result;
    } catch (error) {
      logger.error('Failed to list providers:', error);
      throw new Error(`List providers failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const providerRegistryContract = new ProviderRegistryContract();