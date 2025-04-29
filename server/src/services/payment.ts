import { Keypair } from '@stellar/stellar-sdk';
import { escrowContract } from '../contracts/escrow';
import { PaymentModel } from '../types/models';
import { createLogger } from '../utils/logger';

const logger = createLogger('payment-service');

/**
 * Payment service for managing payments between tenants and providers
 */
export class PaymentService {
  private payments: Map<number, PaymentModel> = new Map();
  private paymentCounter: number = 0;

  /**
   * Initialize the payment service
   */
  constructor() {
    logger.info('Payment service initialized');
  }

  /**
   * Deposit funds into escrow
   * @param tokenAddress Token address
   * @param tenantAddress Tenant address
   * @param amount Amount to deposit
   * @param tenantKeypair Tenant keypair for authentication
   * @returns Payment model
   */
  public async depositFunds(
    tokenAddress: string,
    tenantAddress: string,
    amount: string,
    tenantKeypair: Keypair
  ): Promise<PaymentModel> {
    try {
      logger.info(`Depositing ${amount} from tenant ${tenantAddress}`);
      
      // Deposit funds to escrow
      await escrowContract.deposit(
        tokenAddress,
        tenantAddress,
        amount,
        tenantKeypair
      );
      
      // Create payment model
      const paymentId = ++this.paymentCounter;
      const payment: PaymentModel = {
        id: paymentId,
        leaseId: 0, // No lease associated yet
        tenantAddress,
        providerAddress: '', // No provider yet
        amount,
        tokenAddress,
        status: 'completed',
        txHash: '', // Would be set in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store payment
      this.payments.set(paymentId, payment);
      
      logger.info(`Deposited ${amount} from tenant ${tenantAddress}`);
      return payment;
    } catch (error) {
      logger.error(`Failed to deposit funds from tenant ${tenantAddress}:`, error);
      throw new Error(`Deposit failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Lock funds for an order
   * @param tokenAddress Token address
   * @param tenantAddress Tenant address
   * @param amount Amount to lock
   * @param tenantKeypair Tenant keypair for authentication
   * @returns Payment model
   */
  public async lockFunds(
    tokenAddress: string,
    tenantAddress: string,
    amount: string,
    tenantKeypair: Keypair
  ): Promise<PaymentModel> {
    try {
      logger.info(`Locking ${amount} from tenant ${tenantAddress}`);
      
      // Lock funds in escrow
      await escrowContract.lock(
        tokenAddress,
        tenantAddress,
        amount,
        tenantKeypair
      );
      
      // Create payment model
      const paymentId = ++this.paymentCounter;
      const payment: PaymentModel = {
        id: paymentId,
        leaseId: 0, // No lease associated yet
        tenantAddress,
        providerAddress: '', // No provider yet
        amount,
        tokenAddress,
        status: 'pending',
        txHash: '', // Would be set in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store payment
      this.payments.set(paymentId, payment);
      
      logger.info(`Locked ${amount} from tenant ${tenantAddress}`);
      return payment;
    } catch (error) {
      logger.error(`Failed to lock funds from tenant ${tenantAddress}:`, error);
      throw new Error(`Lock failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transfer locked funds to a provider
   * @param tokenAddress Token address
   * @param tenantAddress Tenant address
   * @param providerAddress Provider address
   * @param providerId Provider ID
   * @param amount Amount to transfer
   * @param leaseId Lease ID
   * @param adminKeypair Admin keypair for authentication
   * @returns Payment model
   */
  public async transferFunds(
    tokenAddress: string,
    tenantAddress: string,
    providerAddress: string,
    providerId: number,
    amount: string,
    leaseId: number,
    adminKeypair: Keypair
  ): Promise<PaymentModel> {
    try {
      logger.info(`Transferring ${amount} from tenant ${tenantAddress} to provider ${providerId}`);
      
      // Transfer locked funds to provider
      await escrowContract.transferLocked(
        tokenAddress,
        tenantAddress,
        amount,
        providerId,
        adminKeypair
      );
      
      // Create payment model
      const paymentId = ++this.paymentCounter;
      const payment: PaymentModel = {
        id: paymentId,
        leaseId,
        tenantAddress,
        providerAddress,
        amount,
        tokenAddress,
        status: 'completed',
        txHash: '', // Would be set in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store payment
      this.payments.set(paymentId, payment);
      
      logger.info(`Transferred ${amount} from tenant ${tenantAddress} to provider ${providerId}`);
      return payment;
    } catch (error) {
      logger.error(`Failed to transfer funds from tenant ${tenantAddress} to provider ${providerId}:`, error);
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Withdraw provider earnings
   * @param tokenAddress Token address
   * @param providerAddress Provider address
   * @param providerKeypair Provider keypair for authentication
   * @returns Payment model
   */
  public async withdrawProviderEarnings(
    tokenAddress: string,
    providerAddress: string,
    providerKeypair: Keypair
  ): Promise<PaymentModel> {
    try {
      logger.info(`Withdrawing earnings for provider ${providerAddress}`);
      
      // Withdraw provider earnings
      await escrowContract.withdrawProviderEarnings(
        tokenAddress,
        providerAddress,
        providerKeypair
      );
      
      // Create payment model
      const paymentId = ++this.paymentCounter;
      const payment: PaymentModel = {
        id: paymentId,
        leaseId: 0, // Multiple leases could be associated
        tenantAddress: '', // Multiple tenants could be associated
        providerAddress,
        amount: '0', // Amount withdrawn is not returned by the contract
        tokenAddress,
        status: 'completed',
        txHash: '', // Would be set in a real implementation
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store payment
      this.payments.set(paymentId, payment);
      
      logger.info(`Withdrawn earnings for provider ${providerAddress}`);
      return payment;
    } catch (error) {
      logger.error(`Failed to withdraw earnings for provider ${providerAddress}:`, error);
      throw new Error(`Withdraw failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get tenant balance
   * @param tokenAddress Token address
   * @param tenantAddress Tenant address
   * @returns Tenant balance object
   */
  public async getTenantBalance(tokenAddress: string, tenantAddress: string): Promise<{
    locked: string;
    unlocked: string;
  }> {
    try {
      logger.info(`Getting balance for tenant ${tenantAddress}`);
      
      // Get tenant balance
      const balance = await escrowContract.getTenantBalance(tokenAddress, tenantAddress);
      
      logger.info(`Retrieved balance for tenant ${tenantAddress}`);
      return {
        locked: balance.locked_balance,
        unlocked: balance.unlocked_balance,
      };
    } catch (error) {
      logger.error(`Failed to get balance for tenant ${tenantAddress}:`, error);
      throw new Error(`Get balance failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get provider earnings
   * @param providerId Provider ID
   * @param tokenAddress Token address
   * @returns Provider earnings object
   */
  public async getProviderEarnings(providerId: number, tokenAddress: string): Promise<{
    earned: string;
    withdrawn: string;
    available: string;
  }> {
    try {
      logger.info(`Getting earnings for provider ${providerId}`);
      
      // Get provider earnings
      const earnings = await escrowContract.getProviderEarnings(providerId, tokenAddress);
      
      logger.info(`Retrieved earnings for provider ${providerId}`);
      return {
        earned: earnings.earned,
        withdrawn: earnings.withdrawn,
        available: earnings.balance,
      };
    } catch (error) {
      logger.error(`Failed to get earnings for provider ${providerId}:`, error);
      throw new Error(`Get earnings failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get payment by ID
   * @param paymentId Payment ID
   * @returns Payment model
   */
  public getPayment(paymentId: number): PaymentModel | undefined {
    return this.payments.get(paymentId);
  }

  /**
   * List all payments
   * @returns List of payment models
   */
  public listPayments(): PaymentModel[] {
    return Array.from(this.payments.values());
  }

  /**
   * List payments for a lease
   * @param leaseId Lease ID
   * @returns List of payment models
   */
  public listPaymentsForLease(leaseId: number): PaymentModel[] {
    return Array.from(this.payments.values()).filter(payment => payment.leaseId === leaseId);
  }

  /**
   * List payments for a tenant
   * @param tenantAddress Tenant address
   * @returns List of payment models
   */
  public listPaymentsForTenant(tenantAddress: string): PaymentModel[] {
    return Array.from(this.payments.values()).filter(payment => payment.tenantAddress === tenantAddress);
  }

  /**
   * List payments for a provider
   * @param providerAddress Provider address
   * @returns List of payment models
   */
  public listPaymentsForProvider(providerAddress: string): PaymentModel[] {
    return Array.from(this.payments.values()).filter(payment => payment.providerAddress === providerAddress);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();