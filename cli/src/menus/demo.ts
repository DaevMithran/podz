import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { 
  formatSectionHeader, 
  formatSubSectionHeader, 
  formatStepHeader,
  generateRandomAddress,
  sleep
} from '../utils.js';

// Demo workflow menu
export const displayDemoWorkflowMenu = async () => {
  formatSectionHeader('Demo Workflows');
  
  console.log(chalk.yellow('These demos provide guided walkthroughs of common PodZ workflows.'));
  console.log(chalk.yellow('Each step will be executed automatically, but you can follow along to understand the process.'));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select a demo workflow:'),
      choices: [
        'Provider Registration & Tenant Order Flow',
        'Complete Deployment Cycle',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'Provider Registration & Tenant Order Flow':
      await runBasicWorkflowDemo();
      break;
      
    case 'Complete Deployment Cycle':
      await runCompleteWorkflowDemo();
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to demo workflow menu after completion
  await displayDemoWorkflowMenu();
};

// Basic workflow demo
const runBasicWorkflowDemo = async () => {
  formatSubSectionHeader('DEMO: Provider Registration & Tenant Order Flow');
  
  // Step 1: Register a provider
  formatStepHeader(1, 'Registering a new provider');
  const providerAddress = generateRandomAddress('podz');
  const provider = await callApi('post', '/providers', {
    address: providerAddress,
    name: 'Demo Provider',
    resources: {
      cpu: 8,
      memory: 16,
      storage: 500
    }
  });
  
  if (!provider) {
    console.log(chalk.red('Demo workflow failed at provider registration.'));
    return;
  }
  
  displayResponse('Provider registered', provider);
  await sleep(1000);
  
  // Step 2: Create an order as tenant
  formatStepHeader(2, 'Creating a new order as tenant');
  const tenantAddress = generateRandomAddress('tenant');
  const order = await callApi('post', '/orders', {
    tenantAddress: tenantAddress,
    spec: 'nodejs:16',
    resources: {
      cpu: 2,
      memory: 4,
      storage: 20
    },
    maxPrice: 5.0,
    numberOfBlocks: 1000,
    trustLevels: ['Three', 'Four', 'Five']
  });
  
  if (!order) {
    console.log(chalk.red('Demo workflow failed at order creation.'));
    return;
  }
  
  displayResponse('Order created', order);
  await sleep(1000);
  
  // Step 3: Provider places bid
  formatStepHeader(3, 'Provider places bid on the order');
  const bid = await callApi('post', `/orders/${order.id}/bids`, {
    providerId: provider.id,
    bidPrice: 4.5
  });
  
  if (!bid) {
    console.log(chalk.red('Demo workflow failed at placing bid.'));
    return;
  }
  
  displayResponse('Bid placed', bid);
  await sleep(1000);
  
  // Step 4: Tenant accepts bid
  formatStepHeader(4, 'Tenant accepts the bid');
  const acceptedBid = await callApi('put', `/bids/${bid.id}/accept`);
  
  if (!acceptedBid) {
    console.log(chalk.red('Demo workflow failed at accepting bid.'));
    return;
  }
  
  displayResponse('Bid accepted and lease created', acceptedBid);
  
  console.log(chalk.green('\nDemo workflow completed successfully!'));
  console.log(chalk.green('A provider was registered, an order created, a bid placed and accepted.'));
  
  // Wait for user to press any key to continue
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: chalk.cyan('Press Enter to return to the demo menu...'),
    }
  ]);
};

// Complete workflow demo
const runCompleteWorkflowDemo = async () => {
  formatSubSectionHeader('DEMO: Complete Deployment Cycle');
  
  // Step 1: Register a provider
  formatStepHeader(1, 'Registering a new provider');
  const fullProviderAddress = generateRandomAddress('podz');
  const fullProvider = await callApi('post', '/providers', {
    address: fullProviderAddress,
    name: 'Complete Demo Provider',
    resources: {
      cpu: 16,
      memory: 32,
      storage: 1000
    }
  });
  
  if (!fullProvider) {
    console.log(chalk.red('Demo workflow failed at provider registration.'));
    return;
  }
  
  displayResponse('Provider registered', fullProvider);
  await sleep(1000);
  
  // Step 2: Deposit funds for tenant
  formatStepHeader(2, 'Depositing funds for tenant');
  const fullTenantAddress = generateRandomAddress('tenant');
  const deposit = await callApi('post', '/payments/deposit', {
    address: fullTenantAddress,
    amount: 100
  });
  
  if (!deposit) {
    console.log(chalk.red('Demo workflow failed at depositing funds.'));
    return;
  }
  
  displayResponse('Funds deposited', deposit);
  await sleep(1000);
  
  // Step 3: Create an order
  formatStepHeader(3, 'Creating a new order as tenant');
  const fullOrder = await callApi('post', '/orders', {
    tenantAddress: fullTenantAddress,
    spec: 'python:3.9',
    resources: {
      cpu: 4,
      memory: 8,
      storage: 50
    },
    maxPrice: 10.0,
    numberOfBlocks: 5000,
    trustLevels: ['Four', 'Five']
  });
  
  if (!fullOrder) {
    console.log(chalk.red('Demo workflow failed at order creation.'));
    return;
  }
  
  displayResponse('Order created', fullOrder);
  await sleep(1000);
  
  // Step 4: Lock funds for the order
  formatStepHeader(4, 'Locking funds for the order');
  const lock = await callApi('post', '/payments/lock', {
    address: fullTenantAddress,
    amount: 50
  });
  
  if (!lock) {
    console.log(chalk.red('Demo workflow failed at locking funds.'));
    return;
  }
  
  displayResponse('Funds locked', lock);
  await sleep(1000);
  
  // Step 5: Provider places bid
  formatStepHeader(5, 'Provider places bid on the order');
  const fullBid = await callApi('post', `/orders/${fullOrder.id}/bids`, {
    providerId: fullProvider.id,
    bidPrice: 8.5
  });
  
  if (!fullBid) {
    console.log(chalk.red('Demo workflow failed at placing bid.'));
    return;
  }
  
  displayResponse('Bid placed', fullBid);
  await sleep(1000);
  
  // Step 6: Tenant accepts bid
  formatStepHeader(6, 'Tenant accepts the bid');
  const fullAcceptedBid = await callApi('put', `/bids/${fullBid.id}/accept`);
  
  if (!fullAcceptedBid) {
    console.log(chalk.red('Demo workflow failed at accepting bid.'));
    return;
  }
  
  displayResponse('Bid accepted and lease created', fullAcceptedBid);
  await sleep(1000);
  
  // Step 7: Check deployment status
  formatStepHeader(7, 'Checking deployment status');
  const deployment = await callApi('get', `/deployments/${fullAcceptedBid.leaseId}`);
  
  if (!deployment) {
    console.log(chalk.red('Demo workflow failed at checking deployment.'));
    return;
  }
  
  displayResponse('Deployment status', deployment);
  await sleep(1000);
  
  // Step 8: Process payment from tenant to provider
  formatStepHeader(8, 'Processing payment from tenant to provider');
  const payment = await callApi('post', `/leases/${fullAcceptedBid.leaseId}/payment`, {
    amount: 8.5
  });
  
  if (!payment) {
    console.log(chalk.red('Demo workflow failed at processing payment.'));
    return;
  }
  
  displayResponse('Payment processed', payment);
  await sleep(1000);
  
  // Step 9: Provider withdraws earnings
  formatStepHeader(9, 'Provider withdraws earnings');
  const withdraw = await callApi('post', '/payments/withdraw', {
    address: fullProviderAddress
  });
  
  if (!withdraw) {
    console.log(chalk.red('Demo workflow failed at withdrawing earnings.'));
    return;
  }
  
  displayResponse('Earnings withdrawn', withdraw);
  await sleep(1000);
  
  // Step 10: Complete the lease
  formatStepHeader(10, 'Completing the lease');
  const completedLease = await callApi('put', `/leases/${fullAcceptedBid.leaseId}/complete`);
  
  if (!completedLease) {
    console.log(chalk.red('Demo workflow failed at completing lease.'));
    return;
  }
  
  displayResponse('Lease completed', completedLease);
  
  console.log(chalk.green('\nComplete deployment cycle demo finished successfully!'));
  console.log(chalk.green('This demonstrated the full lifecycle from provider registration to lease completion.'));
  
  // Wait for user to press any key to continue
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: chalk.cyan('Press Enter to return to the demo menu...'),
    }
  ]);
};