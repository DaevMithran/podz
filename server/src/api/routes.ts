import express from 'express';
import { providerController } from './controllers/provider';
import { orderController } from './controllers/order';
import { deploymentController } from './controllers/deployment';
import { paymentController } from './controllers/payment';
import { leaseController } from './controllers/lease';

/**
 * Setup all API routes
 * @param app Express application
 */
export const setupRoutes = (app: express.Application): void => {
  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API version
  const apiPrefix = '/api/v1';
  
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.status(200).json({ status: 'ok' });
  });


  // Provider routes
  app.get(`${apiPrefix}/providers`, providerController.listProviders);
  app.get(`${apiPrefix}/providers/:id`, providerController.getProvider);
  app.post(`${apiPrefix}/providers`, providerController.registerProvider);
  app.put(`${apiPrefix}/providers/:id/status`, providerController.updateProviderStatus);
  app.put(`${apiPrefix}/providers/:id/trust-level`, providerController.updateProviderTrustLevel);
  app.put(`${apiPrefix}/providers/:id/resources`, providerController.updateProviderResources);

  // Order routes
  app.get(`${apiPrefix}/orders`, orderController.listOrders);
  app.get(`${apiPrefix}/orders/:id`, orderController.getOrder);
  app.post(`${apiPrefix}/orders`, orderController.createOrder);
  app.put(`${apiPrefix}/orders/:id/close`, orderController.closeOrder);
  app.get(`${apiPrefix}/orders/:id/bids`, orderController.getBidsForOrder);
  app.post(`${apiPrefix}/orders/:id/bids`, orderController.placeBid);
  app.put(`${apiPrefix}/bids/:id/accept`, orderController.acceptBid);

  // Lease routes
  app.get(`${apiPrefix}/leases`, leaseController.listLeases);
  app.get(`${apiPrefix}/leases/:id`, leaseController.getLease);
  app.post(`${apiPrefix}/leases`, leaseController.createLease);
  app.put(`${apiPrefix}/leases/:id/complete`, leaseController.completeLease);
  app.put(`${apiPrefix}/leases/:id/cancel`, leaseController.cancelLease);
  app.post(`${apiPrefix}/leases/:id/payment`, leaseController.processPayment);
  app.get(`${apiPrefix}/leases/:id/health`, leaseController.checkLeaseHealth);
  app.get(`${apiPrefix}/leases/:id/logs`, leaseController.getLeaseLogs);
  app.get(`${apiPrefix}/providers/:id/leases`, leaseController.getLeasesForProvider);
  app.get(`${apiPrefix}/orders/:id/leases`, leaseController.getLeasesForOrder);

  // Deployment routes
  app.get(`${apiPrefix}/deployments`, deploymentController.listDeployments);
  app.get(`${apiPrefix}/deployments/:leaseId`, deploymentController.getDeployment);
  app.put(`${apiPrefix}/deployments/:leaseId/stop`, deploymentController.stopDeployment);

  // Payment routes
  app.get(`${apiPrefix}/payments`, paymentController.listPayments);
  app.get(`${apiPrefix}/payments/:id`, paymentController.getPayment);
  app.post(`${apiPrefix}/payments/deposit`, paymentController.depositFunds);
  app.post(`${apiPrefix}/payments/lock`, paymentController.lockFunds);
  app.post(`${apiPrefix}/payments/withdraw`, paymentController.withdrawProviderEarnings);
  app.get(`${apiPrefix}/tenants/:address/balance`, paymentController.getTenantBalance);
  app.get(`${apiPrefix}/providers/:id/earnings`, paymentController.getProviderEarnings);
  app.get(`${apiPrefix}/leases/:id/payments`, paymentController.getPaymentsForLease);
  app.get(`${apiPrefix}/tenants/:address/payments`, paymentController.getPaymentsForTenant);
  app.get(`${apiPrefix}/providers/:address/payments`, paymentController.getPaymentsForProvider);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
  });
};