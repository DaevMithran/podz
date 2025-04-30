import { Keypair } from '@stellar/stellar-sdk';
import { sorobanClient } from './client';
import config from '../config';
import { Tenant, ProviderToken } from '../types/contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('escrow-contract');

/**
 * Escrow Contract client for interacting with the escrow contract
 */
export class EscrowContract {
  private contractId: string;

  /**
   * Initialize the escrow contract client
   */
  constructor() {
    this.contractId = config.soroban.escrowId;
    
    if (!this.contractId) {
      logger.error('Escrow contract ID not set in configuration');
      throw new Error('Escrow contract ID not set in configuration');
    }
    
    logger.info('Escrow contract client initialized');
  }

  /**
   * Deposit funds into the escrow
   * @param tokenAddress Token address
   * @param from Sender address
   * @param amount Amount to deposit
   * @param senderKeypair Sender keypair for authentication
   */
  public async deposit(
    tokenAddress: string,
    from: string,
    amount: string,
    senderKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Depositing ${amount} from ${from}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'deposit',
        [senderKeypair,
        tokenAddress,
        from,
        amount]
      );
      
      logger.info(`Deposited ${amount} from ${from}`);
    } catch (error) {
      logger.error(`Failed to deposit ${amount} from ${from}:`, error);
      throw new Error(`Deposit failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Withdraw funds from the escrow
   * @param tokenAddress Token address
   * @param to Recipient address
   * @param amount Amount to withdraw
   * @param senderKeypair Sender keypair for authentication
   */
  public async withdraw(
    tokenAddress: string,
    to: string,
    amount: string,
    senderKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Withdrawing ${amount} to ${to}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'withdraw',
        [senderKeypair,
        tokenAddress,
        to,
        amount]
      );
      
      logger.info(`Withdrawn ${amount} to ${to}`);
    } catch (error) {
      logger.error(`Failed to withdraw ${amount} to ${to}:`, error);
      throw new Error(`Withdraw failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lock funds in the escrow
   * @param tokenAddress Token address
   * @param from Sender address
   * @param amount Amount to lock
   * @param senderKeypair Sender keypair for authentication
   */
  public async lock(
    tokenAddress: string,
    from: string,
    amount: string,
    senderKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Locking ${amount} from ${from}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'lock',
        [tokenAddress,
        from,
        amount]
      );
      
      logger.info(`Locked ${amount} from ${from}`);
    } catch (error) {
      logger.error(`Failed to lock ${amount} from ${from}:`, error);
      throw new Error(`Lock failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Unlock funds in the escrow
   * @param tokenAddress Token address
   * @param from Sender address
   * @param amount Amount to unlock
   */
  public async unlockTokens(
    tokenAddress: string,
    from: string,
    amount: string,
    senderKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Unlocking ${amount} from ${from}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'unlock_tokens',
        [tokenAddress,
        from,
        amount]
      );
      
      logger.info(`Unlocked ${amount} from ${from}`);
    } catch (error) {
      logger.error(`Failed to unlock ${amount} from ${from}:`, error);
      throw new Error(`Unlock failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transfer locked funds to a provider
   * @param tokenAddress Token address
   * @param from Sender address
   * @param amount Amount to transfer
   * @param providerId Provider ID
   * @param senderKeypair Sender keypair for authentication
   */
  public async transferLocked(
    tokenAddress: string,
    from: string,
    amount: string,
    providerId: number,
    senderKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Transferring ${amount} from ${from} to provider ${providerId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'transfer_locked',
        [tokenAddress,
        from,
        amount,
        providerId]
      );
      
      logger.info(`Transferred ${amount} from ${from} to provider ${providerId}`);
    } catch (error) {
      logger.error(`Failed to transfer ${amount} from ${from} to provider ${providerId}:`, error);
      throw new Error(`Transfer locked failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Withdraw provider earnings
   * @param tokenAddress Token address
   * @param providerAddress Provider address
   * @param providerKeypair Provider keypair for authentication
   */
  public async withdrawProviderEarnings(
    tokenAddress: string,
    providerAddress: string,
    providerKeypair: Keypair
  ): Promise<void> {
    try {
      logger.info(`Withdrawing earnings for provider ${providerAddress}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod(
        contract,
        'withdraw_provider_earnings',
        [providerKeypair,
        providerAddress,
        tokenAddress]
      );
      
      logger.info(`Withdrawn earnings for provider ${providerAddress}`);
    } catch (error) {
      logger.error(`Failed to withdraw earnings for provider ${providerAddress}:`, error);
      throw new Error(`Withdraw provider earnings failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get tenant balance
   * @param tokenAddress Token address
   * @param from Tenant address
   * @returns Tenant balance
   */
  public async getTenantBalance(tokenAddress: string, from: string): Promise<Tenant> {
    try {
      logger.info(`Getting balance for tenant ${from}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<Tenant>(
        contract,
        'get_tenant_balance',
        [tokenAddress,
        from]
      );
      
      logger.info(`Retrieved balance for tenant ${from}`);
      return result;
    } catch (error) {
      logger.error(`Failed to get balance for tenant ${from}:`, error);
      throw new Error(`Get tenant balance failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get provider earnings
   * @param providerId Provider ID
   * @param tokenAddress Token address
   * @returns Provider earnings
   */
  public async getProviderEarnings(providerId: number, tokenAddress: string): Promise<ProviderToken> {
    try {
      logger.info(`Getting earnings for provider ${providerId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<ProviderToken>(
        contract,
        'get_provider_earnings',
        [providerId,
        tokenAddress]
      );
      
      logger.info(`Retrieved earnings for provider ${providerId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to get earnings for provider ${providerId}:`, error);
      throw new Error(`Get provider earnings failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const escrowContract = new EscrowContract();