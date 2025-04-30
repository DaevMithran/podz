import { Contract, Keypair, TransactionBuilder, SorobanRpc, Networks, BASE_FEE, nativeToScVal, Address, scValToNative, xdr } from '@stellar/stellar-sdk';
import config from '../config';
import { Logger } from 'winston';
import { createLogger } from '../utils/logger';

// Initialize logger
const logger: Logger = createLogger('soroban-client');

    // Utility functions for ScVal conversion
    export const addressToScVal = (address: string) => {
        // Validate address format
        if (!address.match(/^[CG][A-Z0-9]{55}$/)) {
            throw new Error(`Invalid address format: ${address}`);
        }
        return nativeToScVal(new Address(address), { type: "address" });
    };
        
    export const numberToI128 = (value: string | BigInt) => {
        return nativeToScVal(typeof value === 'string' ? BigInt(value) : value, { type: "i128" });
    };
        
    export const booleanToScVal = (value: boolean) => {
        return nativeToScVal(value, { type: "bool" });
    };

/**
 * Soroban client for interacting with the blockchain
 */
export class SorobanClient {
  private server: SorobanRpc.Server;
  private adminKeypair: Keypair;
  /**
   * Initialize the Soroban client
   */
  constructor() {
    this.server = new SorobanRpc.Server(config.soroban.rpcUrl, { allowHttp: true });
    this.adminKeypair = Keypair.fromSecret(config.soroban.signerSecretKey);

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
  public async callMethod<T>(contract: Contract, method: string, args: any): Promise<any> {
    try {
      const account = await this.server.getAccount(this.adminKeypair.publicKey());
      
      const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      });
      let transaction: any;
      if (args == null) {
        transaction = builder
          .addOperation(contract.call(method))
          .setTimeout(300)
          .build();
      } else if (Array.isArray(args)) {
        transaction = builder
          .addOperation(contract.call(method, ...args))
          .setTimeout(300)
          .build();
      } else {
        transaction = builder
          .addOperation(contract.call(method, args))
          .setTimeout(300)
          .build();
      }

        const simulation = await this.server.simulateTransaction(transaction).catch((err) => {
            console.error(`Simulation failed for ${method}: ${err.message}`);
            throw new Error(`Failed to simulate transaction: ${err.message}`);
          });
      
          console.log(`Simulation response for ${method}:`, JSON.stringify(simulation, null, 2));
      
          if ("results" in simulation && Array.isArray(simulation.results) && simulation.results.length > 0) {
            console.log(`Read-only call detected for ${method}`);
            const result = simulation.results[0];
            if (result.xdr) {
              try {
                // Parse the return value from XDR
                const scVal = xdr.ScVal.fromXDR(result.xdr, "base64");
                const parsedValue = scValToNative(scVal);
                console.log(`Parsed simulation result for ${method}:`, parsedValue);
                return parsedValue; // Returns string for share_id, array for get_rsrvs
              } catch (err) {
                console.error(`Failed to parse XDR for ${method}:`, err);
                throw new Error(`Failed to parse simulation result: ${err instanceof Error ? err.message : String(err)}`);
              }
            }
            console.error(`No xdr field in simulation results[0] for ${method}:`, result);
            throw new Error("No return value in simulation results");
          } else if ("error" in simulation) {
            console.error(`Simulation error for ${method}:`, simulation.error);
            throw new Error(`Simulation failed: ${simulation.error}`);
          }
      
          // For state-changing calls, prepare and submit transaction
          console.log(`Submitting transaction for ${method}`);
          const preparedTx = await this.server.prepareTransaction(transaction).catch((err) => {
            console.error(`Prepare transaction failed for ${method}: ${err.message}`);
            throw new Error(`Failed to prepare transaction: ${err.message}`);
          });
          const prepareTxXDR = preparedTx.toXDR();
      
          let signedTxResponse: string;
          try {
            signedTxResponse = await this.signTransaction(prepareTxXDR);
          } catch (err: any) {
            throw new Error(`Failed to sign transaction: ${err.message}`);
          }
      
          // Handle both string and object response from signTransaction
          const signedXDR = signedTxResponse
      
          const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
          const txResult = await this.server.sendTransaction(tx).catch((err) => {
            console.error(`Send transaction failed for ${method}: ${err.message}`);
            throw new Error(`Send transaction failed: ${err.message}`);
          });
      
          let txResponse = await this.server.getTransaction(txResult.hash);
          const maxRetries = 30;
          let retries = 0;
      
          while (txResponse.status === "NOT_FOUND" && retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            txResponse = await this.server.getTransaction(txResult.hash);
            retries++;
          }
    
          if (txResponse.status === "NOT_FOUND") {
            throw new Error("Transaction is still pending. Please check status later using this hash.");
          }
      
          if (txResponse.status !== "SUCCESS") {
            console.error(`Transaction failed for ${method} with status: ${txResponse.status}`, JSON.stringify(txResponse, null, 2));
            throw new Error(`Transaction failed with status: ${txResponse.status}`);
          }
      
          // Parse return value if present (e.g., for withdraw)
          if (txResponse.returnValue) {
            try {
              // returnValue is already an ScVal, no need for fromXDR
              const parsedValue = scValToNative(txResponse.returnValue);
              console.log(`Parsed transaction result for ${method}:`, parsedValue);
              return parsedValue; // Returns array for withdraw
            } catch (err) {
              console.error(`Failed to parse transaction return value for ${method}:`, err);
              throw new Error(`Failed to parse transaction result: ${err instanceof Error ? err.message : String(err)}`);
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error in contract interaction (${method}):`, errorMessage);
          throw error;
        }
    }

    async signTransaction (txXDR: string) {
    const transaction = TransactionBuilder.fromXDR(txXDR, Networks.TESTNET);
    transaction.sign(this.adminKeypair);
    return transaction.toXDR();
    };
    

  public async getAddress() {
    return this.adminKeypair.publicKey()
  }
}

// Export singleton instance
export const sorobanClient = new SorobanClient();