import { sorobanClient } from '../contracts/client';
import { orderBookContract } from '../contracts/order-book';
import { BidState, OrderRequest, TrustLevel } from '../types/contracts';
import { BidModel, ContainerSpecification, OrderModel } from '../types/models';
import { createLogger } from '../utils/logger';

const logger = createLogger('order-service');

/**
 * Order service for managing orders and bids
 */
export class OrderService {
  /**
   * Create a new order
   * @param tenantAddress Tenant address
   * @param maxPrice Maximum price
   * @param spec Container specification
   * @param trustLevels Required trust levels
   * @param quantity Number of instances
   * @param durationBlocks Duration in blocks
   * @returns Order model
   */
  public async createOrder(
    maxPrice: string,
    spec: ContainerSpecification,
    trustLevels: TrustLevel[],
    quantity: number,
    durationBlocks: number
  ): Promise<OrderModel> {
    try {
      const tenantAddress = await sorobanClient.getAddress()
      logger.info(`Creating order for tenant ${tenantAddress}`);
      
      // Convert container specification to JSON string
      const specJson = JSON.stringify({
        cpu: spec.cpu,
        memory: spec.memory
      });

      logger.info(specJson)
      
      // Create order on chain
      const orderId = await orderBookContract.createOrder(
        maxPrice,
        durationBlocks,
        quantity,
        specJson,
        trustLevels
      );
      
      // Get created order
      const orderRequest = await orderBookContract.getOrder(orderId);
      
      // Calculate estimated duration in hours (assuming 5 second block time)
      const estimatedDurationHours = (durationBlocks * 5) / 3600;
      
      // Create order model
      const orderModel: OrderModel = {
        id: orderId,
        tenantAddress,
        maxPrice,
        specification: spec,
        requiredTrustLevels: trustLevels,
        quantity,
        durationBlocks,
        estimatedDurationHours,
        state: orderRequest.state,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      logger.info(`Order created with ID ${orderId}`);
      return orderModel;
    } catch (error) {
      logger.error(`Failed to create order for tenant:`, error);
      throw new Error(`Order creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Close an order
   * @param orderId Order ID
   * @returns Updated order model
   */
  public async closeOrder(orderId: number): Promise<OrderModel> {
    try {
      logger.info(`Closing order with ID ${orderId}`);
      
      // Close order on chain
      await orderBookContract.closeOrder(orderId);
      
      // Get updated order
      const orderRequest = await orderBookContract.getOrder(orderId);
      
      // Create order model
      // In a real implementation, you would retrieve the full order details from a database
      const orderModel: OrderModel = {
        id: orderId,
        tenantAddress: await sorobanClient.getAddress(), // Would be fetched from database
        maxPrice: orderRequest.max_price,
        specification: JSON.parse(orderRequest.spec.spec),
        requiredTrustLevels: orderRequest.spec.trust_levels,
        quantity: orderRequest.spec.quantity,
        durationBlocks: orderRequest.number_of_blocks,
        estimatedDurationHours: (orderRequest.number_of_blocks * 5) / 3600,
        state: orderRequest.state,
        createdAt: new Date(), // Would be fetched from database
        updatedAt: new Date(),
      };
      
      logger.info(`Order ${orderId} closed`);
      return orderModel;
    } catch (error) {
      logger.error(`Failed to close order ${orderId}:`, error);
      throw new Error(`Close order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get an order by ID
   * @param orderId Order ID
   * @returns Order model
   */
  public async getOrder(orderId: number): Promise<OrderModel> {
    try {
      logger.info(`Getting order with ID ${orderId}`);
      
      // Get order from chain
      const orderRequest = await orderBookContract.getOrder(orderId);
      
      // Parse specification
      let specification: ContainerSpecification;
      try {
        specification = JSON.parse(orderRequest.spec.spec);
      } catch (error) {
        logger.error(`Failed to parse specification for order ${orderId}:`, error);
        specification = {
          image: 'unknown',
          cpu: 0,
          memory: 0,
          storage: 0,
        };
      }
      
      // Create order model
      const orderModel: OrderModel = {
        id: orderId,
        tenantAddress: await sorobanClient.getAddress(), // Would be fetched from database
        maxPrice: orderRequest.max_price,
        specification,
        requiredTrustLevels: orderRequest.spec.trust_levels,
        quantity: orderRequest.spec.quantity,
        durationBlocks: orderRequest.number_of_blocks,
        estimatedDurationHours: (orderRequest.number_of_blocks * 5) / 3600,
        state: orderRequest.state,
        createdAt: new Date(), // Would be fetched from database
        updatedAt: new Date(),
      };
      
      logger.info(`Order ${orderId} retrieved`);
      return orderModel;
    } catch (error) {
      logger.error(`Failed to get order ${orderId}:`, error);
      throw new Error(`Get order failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all orders
   * @returns List of order models
   */
  public async listOrders(): Promise<OrderModel[]> {
    try {
      logger.info('Listing all orders');
      
      // Get orders from chain
      const orderRequests = await orderBookContract.listOrders();
      
      // Create order models
      const orderModels: OrderModel[] = orderRequests.map((orderRequest, index) => {
        // Parse specification
        let specification: ContainerSpecification;
        try {
          specification = JSON.parse(orderRequest.spec.spec);
        } catch (error) {
          logger.error(`Failed to parse specification for order ${index + 1}:`, error);
          specification = {
            image: 'unknown',
            cpu: 0,
            memory: 0,
            storage: 0,
          };
        }
        
        return {
          id: index + 1, // This is an approximation; in a real system, you'd map the actual IDs
          tenantAddress: '', // Would be fetched from database
          maxPrice: orderRequest.max_price,
          specification,
          requiredTrustLevels: orderRequest.spec.trust_levels,
          quantity: orderRequest.spec.quantity,
          durationBlocks: orderRequest.number_of_blocks,
          estimatedDurationHours: (orderRequest.number_of_blocks * 5) / 3600,
          state: orderRequest.state,
          createdAt: new Date(), // Would be fetched from database
          updatedAt: new Date(),
        };
      });
      
      logger.info(`Retrieved ${orderModels.length} orders`);
      return orderModels;
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
   * @returns Bid model
   */
  public async placeBid(
    orderId: number,
    providerId: number,
    bidPrice: string
  ): Promise<BidModel> {
    try {
      logger.info(`Placing bid on order ${orderId} by provider ${providerId} for ${bidPrice}`);
      
      // Place bid on chain
      const bidId = await orderBookContract.placeBid(orderId, providerId, bidPrice);
      
      // Create bid model
      const bidModel: BidModel = {
        id: bidId,
        orderId,
        providerId,
        price: bidPrice,
        state: BidState.Active,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      logger.info(`Bid placed with ID ${bidId}`);
      return bidModel;
    } catch (error) {
      logger.error(`Failed to place bid on order ${orderId}:`, error);
      throw new Error(`Place bid failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Accept a bid
   * @param bidId Bid ID
   * @returns Updated bid model
   */
  public async acceptBid(bidId: number): Promise<BidModel> {
    try {
      logger.info(`Accepting bid with ID ${bidId}`);
      
      // Accept bid on chain
      await orderBookContract.acceptBid(bidId);
      
      // In a real implementation, you would retrieve the full bid details from a database
      // and update the bid state
      const bidModel: BidModel = {
        id: bidId,
        orderId: 0, // Would be fetched from database
        providerId: 0, // Would be fetched from database
        price: '0', // Would be fetched from database
        state: BidState.Matched,
        createdAt: new Date(), // Would be fetched from database
        updatedAt: new Date(),
      };
      
      logger.info(`Bid ${bidId} accepted`);
      return bidModel;
    } catch (error) {
      logger.error(`Failed to accept bid ${bidId}:`, error);
      throw new Error(`Accept bid failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get bids for an order
   * @param orderId Order ID
   * @returns List of bid models
   */
  public async getBidsForOrder(orderId: number): Promise<BidModel[]> {
    try {
      logger.info(`Getting bids for order ${orderId}`);
      
      // Note: This would require a database query in a real implementation
      // since the contract doesn't provide a direct way to list bids for an order
      
      // Placeholder: In a real implementation, you would query a database for bids
      // where orderId matches the given orderId
      const bids: BidModel[] = [];
      
      logger.info(`Retrieved ${bids.length} bids for order ${orderId}`);
      return bids;
    } catch (error) {
      logger.error(`Failed to get bids for order ${orderId}:`, error);
      throw new Error(`Get bids failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();