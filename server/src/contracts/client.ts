import { Contract, Keypair, TransactionBuilder, SorobanRpc, Networks, BASE_FEE } from '@stellar/stellar-sdk';
import config from '../config';
import { Logger } from 'winston';
import { createLogger } from '../utils/logger';

// Initialize logger
const logger: Logger = createLogger('soroban-client');

/**
 * Soroban client for interacting with the blockchain
 */
export class SorobanClient {
  private server: SorobanRpc.Server;
  private adminKeypair: Keypair;
  private networkPassphrase: string;

  /**
   * Initialize the Soroban client
   */
  constructor() {
    this.server = new SorobanRpc.Server(config.soroban.rpcUrl, { allowHttp: true });
    this.adminKeypair = Keypair.fromSecret(config.soroban.signerSecretKey);
    this.networkPassphrase = config.soroban.networkPassphrase;

    logger.info('Soroban client initialized');
  }

  /**
   * Get the admin public key
   * @returns Admin public key
   */
  public getAdminPublicKey(): string {
    return this.adminKeypair.publicKey();
  }

  /**
   * Create a contract instance
   * @param contractId Contract ID
   * @returns Contract instance
   */
  public getContract(contractId: string): Contract {
    try {
      return new Contract(contractId);
    } catch (error) {
      logger.error(`Failed to create contract instance for ${contractId}:`, error);
      throw new Error(`Contract initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a contract method
   * @param contract Contract instance
   * @param method Method name
   * @param args Method arguments
   * @returns Method result
   */
  public async callMethod<T>(contract: Contract, method: string, ...args: any[]): Promise<T> {
    try {
      const account = await this.server.getAccount(this.adminKeypair.publicKey());
      
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(30)
        .build();

        tx.sign(this.adminKeypair)
      
      const sendResponse = await this.server.sendTransaction(tx);
      if (sendResponse.errorResult) {
        throw new Error(`Transaction Failed: ${JSON.stringify(sendResponse.errorResult)}`)
      }
      
      if (sendResponse.status !== 'PENDING') {
        throw new Error(`Transaction not pending error`)
      }
  
       let getResponse: any
        //   we will continously checking the transaction status until it gets successfull added to the blockchain ledger or it gets rejected
        do {
          getResponse = await this.server.getTransaction(sendResponse.hash);
          await new Promise((resolve) => setTimeout(resolve, 100));
        } while (getResponse.status === "NOT_FOUND");
        
        
        if (getResponse.status !== 'SUCCESS') {
            throw new Error(`Transaction failed: ${getResponse.status}`);
        }
        
        const result = (getResponse as any).returnValue;
        return result as T;
    } catch (error) {
      logger.error(`Error calling method ${method}:`, error);
      throw new Error(`Contract method call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async getAddress() {
    return this.adminKeypair.publicKey()
  }
}

// Export singleton instance
export const sorobanClient = new SorobanClient();