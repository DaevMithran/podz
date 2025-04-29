import { sorobanClient } from './client';
import config from '../config';
import { OrderRequest, TrustLevel } from '../types/contracts';
import { createLogger } from '../utils/logger';
import { nativeToScVal } from '@stellar/stellar-sdk';

const logger = createLogger('order-book-contract');

/**
 * OrderBook Contract client for interacting with the order book contract
 */
export class OrderBookContract {
  private contractId: string;

  /**
   * Initialize the order book contract client
   */
  constructor() {
    this.contractId = config.soroban.orderBookId;
    
    if (!this.contractId) {
      logger.error('Order book contract ID not set in configuration');
      throw new Error('Order book contract ID not set in configuration');
    }
    
    logger.info('Order book contract client initialized');
  }

  /**
   * Create a new order
   * @param maxPrice Maximum price per block
   * @param numberOfBlocks Number of blocks the order should run for
   * @param quantity Number of instances
   * @param spec Container specification JSON string
   * @param trustLevels Required trust levels
   * @returns Order ID
   */
  public async createOrder(
    maxPrice: string, 
    numberOfBlocks: number, 
    quantity: number, 
    spec: string, 
    trustLevels: TrustLevel[]
  ): Promise<number> {
    try {
      logger.info(`Creating order with max price ${maxPrice}, ${numberOfBlocks} blocks`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<number>(
        contract,
        'create_order',
        nativeToScVal(maxPrice, {type: "u128"}),
        nativeToScVal(numberOfBlocks, {type: "u32"}),
        nativeToScVal(quantity, {type: "u64"}),
        nativeToScVal(spec, { type: "symbol"}),
        nativeToScVal(trustLevels),
      );
      
      logger.info(`Order created with ID ${result}`);
      return result;
    } catch (error) {
      logger.error('Failed to create order:', error);
      throw new Error(`Create order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close an order
   * @param orderId Order ID
   */
  public async closeOrder(orderId: number): Promise<void> {
    try {
      logger.info(`Closing order with ID ${orderId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod<void>(
        contract,
        'update_order_to_closed',
        orderId
      );
      
      logger.info(`Order ${orderId} closed`);
    } catch (error) {
      logger.error(`Failed to close order ${orderId}:`, error);
      throw new Error(`Close order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get an order by ID
   * @param orderId Order ID
   * @returns Order request
   */
  public async getOrder(orderId: number): Promise<OrderRequest> {
    try {
      logger.info(`Getting order with ID ${orderId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<OrderRequest>(
        contract,
        'get_order',
        nativeToScVal(orderId, { type: "u64"})
      );
      
      logger.info(`Retrieved order ${orderId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to get order ${orderId}:`, error);
      throw new Error(`Get order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all orders
   * @returns List of orders
   */
  public async listOrders(): Promise<OrderRequest[]> {
    try {
      logger.info('Listing all orders');
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<OrderRequest[]>(
        contract,
        'list_orders'
      );
      
      logger.info(`Retrieved ${result.length} orders`);
      return result;
    } catch (error) {
      logger.error('Failed to list orders:', error);
      throw new Error(`List orders failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Place a bid on an order
   * @param orderId Order ID
   * @param providerId Provider ID
   * @param bidPrice Bid price
   * @returns Bid ID
   */
  public async placeBid(orderId: number, providerId: number, bidPrice: string): Promise<number> {
    try {
      logger.info(`Placing bid on order ${orderId} by provider ${providerId} for ${bidPrice}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      const result = await sorobanClient.callMethod<number>(
        contract,
        'place_bid',
        orderId,
        providerId,
        bidPrice
      );
      
      logger.info(`Bid placed with ID ${result}`);
      return result;
    } catch (error) {
      logger.error(`Failed to place bid on order ${orderId}:`, error);
      throw new Error(`Place bid failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Accept a bid
   * @param bidId Bid ID
   */
  public async acceptBid(bidId: number): Promise<void> {
    try {
      logger.info(`Accepting bid with ID ${bidId}`);
      const contract = sorobanClient.getContract(this.contractId);
      
      await sorobanClient.callMethod<void>(
        contract,
        'accept_bid',
        bidId
      );
      
      logger.info(`Bid ${bidId} accepted and lease created`);
    } catch (error) {
      logger.error(`Failed to accept bid ${bidId}:`, error);
      throw new Error(`Accept bid failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const orderBookContract = new OrderBookContract();