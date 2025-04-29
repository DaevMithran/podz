import { Request, Response } from 'express';
import { orderService } from '../../services/order';
import { TrustLevel } from '../../types/contracts';
import { ContainerSpecification } from '../../types/models';
import { createLogger } from '../../utils/logger';

const logger = createLogger('order-controller');

/**
 * Order controller for handling order-related API requests
 */
class OrderController {
  /**
   * Create a new order
   * @param req Request
   * @param res Response
   */
  public createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        maxPrice,
        specification,
        trustLevels,
        quantity,
        durationBlocks,
      } = req.body;
      
      if (!maxPrice) {
        res.status(400).json({ error: { message: 'Max price is required' } });
        return;
      }
      
      if (!specification) {
        res.status(400).json({ error: { message: 'Container specification is required' } });
        return;
      }
      
      if (!specification.image) {
        res.status(400).json({ error: { message: 'Container image is required' } });
        return;
      }
      
      if (!trustLevels || !Array.isArray(trustLevels) || trustLevels.length === 0) {
        res.status(400).json({ error: { message: 'Trust levels are required' } });
        return;
      }
      
      // Validate trust levels
      const validTrustLevels = trustLevels.every(level => 
        Object.values(TrustLevel).includes(level as TrustLevel)
      );
      
      if (!validTrustLevels) {
        res.status(400).json({ error: { message: 'Invalid trust levels' } });
        return;
      }
      
      const order = await orderService.createOrder(
        maxPrice,
        specification as ContainerSpecification,
        trustLevels as TrustLevel[],
        quantity,
        durationBlocks
      );
      
      res.status(201).json({ order });
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        error: {
          message: 'Failed to create order',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get an order by ID
   * @param req Request
   * @param res Response
   */
  public getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      const order = await orderService.getOrder(parseInt(id));
      
      res.status(200).json({ order });
    } catch (error) {
      logger.error(`Error getting order ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get order',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * List all orders
   * @param req Request
   * @param res Response
   */
  public listOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await orderService.listOrders();
      
      res.status(200).json({ orders });
    } catch (error) {
      logger.error('Error listing orders:', error);
      res.status(500).json({
        error: {
          message: 'Failed to list orders',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Close an order
   * @param req Request
   * @param res Response
   */
  public closeOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      const order = await orderService.closeOrder(parseInt(id));
      
      res.status(200).json({ order });
    } catch (error) {
      logger.error(`Error closing order ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to close order',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Place a bid on an order
   * @param req Request
   * @param res Response
   */
  public placeBid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { providerId, bidPrice } = req.body;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      if (!providerId) {
        res.status(400).json({ error: { message: 'Provider ID is required' } });
        return;
      }
      
      if (!bidPrice) {
        res.status(400).json({ error: { message: 'Bid price is required' } });
        return;
      }
      
      const bid = await orderService.placeBid(
        parseInt(id),
        providerId,
        bidPrice
      );
      
      res.status(201).json({ bid });
    } catch (error) {
      logger.error(`Error placing bid on order ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to place bid',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Accept a bid
   * @param req Request
   * @param res Response
   */
  public acceptBid = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Bid ID is required' } });
        return;
      }
      
      const bid = await orderService.acceptBid(parseInt(id));
      
      res.status(200).json({ bid });
    } catch (error) {
      logger.error(`Error accepting bid ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to accept bid',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  /**
   * Get bids for an order
   * @param req Request
   * @param res Response
   */
  public getBidsForOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: { message: 'Order ID is required' } });
        return;
      }
      
      const bids = await orderService.getBidsForOrder(parseInt(id));
      
      res.status(200).json({ bids });
    } catch (error) {
      logger.error(`Error getting bids for order ${req.params.id}:`, error);
      res.status(500).json({
        error: {
          message: 'Failed to get bids',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };
}

// Export singleton instance
export const orderController = new OrderController();