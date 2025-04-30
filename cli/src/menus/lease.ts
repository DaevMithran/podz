import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { formatSectionHeader, validateNotEmpty, validateNumber } from '../utils.js';

// Lease menu
export const displayLeaseMenu = async () => {
  formatSectionHeader('Lease Management');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select a Lease action:'),
      choices: [
        'List Leases', 
        'Get Lease Details',
        'Create Lease',
        'Complete Lease',
        'Cancel Lease',
        'Process Lease Payment',
        'Check Lease Health',
        'Get Lease Logs',
        'Get Leases for Provider',
        'Get Leases for Order',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'List Leases':
      const leases = await callApi('get', '/leases');
      if (leases) {
        displayResponse('Leases', leases);
      }
      break;
    
    case 'Get Lease Details':
      const { leaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'leaseId',
          message: chalk.cyan('Enter lease ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const lease = await callApi('get', `/leases/${leaseId}`);
      if (lease) {
        displayResponse('Lease Details', lease);
      }
      break;
    
    case 'Create Lease':
      const leaseData = await inquirer.prompt([
        {
          type: 'input',
          name: 'orderId',
          message: chalk.cyan('Enter order ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'providerId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'startBlock',
          message: chalk.cyan('Enter start block number:'),
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'endBlock',
          message: chalk.cyan('Enter end block number:'),
          validate: validateNumber
        }
      ]);
      
      const newLease = await callApi('post', '/leases', {
        orderId: parseInt(leaseData.orderId),
        providerId: parseInt(leaseData.providerId),
        startBlock: parseInt(leaseData.startBlock),
        endBlock: parseInt(leaseData.endBlock)
      });
      
      if (newLease) {
        displayResponse('Lease Created', newLease);
      }
      break;
    
    case 'Complete Lease':
      const { completeLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'completeLeaseId',
          message: chalk.cyan('Enter lease ID to complete:'),
          validate: validateNotEmpty
        }
      ]);
      
      const completedLease = await callApi('put', `/leases/${completeLeaseId}/complete`);
      if (completedLease) {
        displayResponse('Lease Completed', completedLease);
      }
      break;
    
    case 'Cancel Lease':
      const { cancelLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'cancelLeaseId',
          message: chalk.cyan('Enter lease ID to cancel:'),
          validate: validateNotEmpty
        }
      ]);
      
      const canceledLease = await callApi('put', `/leases/${cancelLeaseId}/cancel`);
      if (canceledLease) {
        displayResponse('Lease Canceled', canceledLease);
      }
      break;
    
    case 'Process Lease Payment':
      const paymentData = await inquirer.prompt([
        {
          type: 'input',
          name: 'leaseId',
          message: chalk.cyan('Enter lease ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'amount',
          message: chalk.cyan('Enter payment amount (AKT):'),
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'tokenAddress',
          message: chalk.cyan('Enter token address (optional):'),
          default: ''
        }
      ]);
      
      const leasePayment = await callApi('post', `/leases/${paymentData.leaseId}/payment`, {
        amount: parseFloat(paymentData.amount),
        tokenAddress: paymentData.tokenAddress || null
      });
      
      if (leasePayment) {
        displayResponse('Lease Payment Processed', leasePayment);
      }
      break;
    
    case 'Check Lease Health':
      const { healthLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'healthLeaseId',
          message: chalk.cyan('Enter lease ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const leaseHealth = await callApi('get', `/leases/${healthLeaseId}/health`);
      if (leaseHealth) {
        displayResponse('Lease Health', leaseHealth);
      }
      break;
    
    case 'Get Lease Logs':
      const { logsLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'logsLeaseId',
          message: chalk.cyan('Enter lease ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const leaseLogs = await callApi('get', `/leases/${logsLeaseId}/logs`);
      if (leaseLogs) {
        displayResponse('Lease Logs', leaseLogs);
      }
      break;
    
    case 'Get Leases for Provider':
      const { providerLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerLeaseId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const providerLeases = await callApi('get', `/providers/${providerLeaseId}/leases`);
      if (providerLeases) {
        displayResponse('Provider Leases', providerLeases);
      }
      break;
    
    case 'Get Leases for Order':
      const { orderLeaseId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'orderLeaseId',
          message: chalk.cyan('Enter order ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const orderLeases = await callApi('get', `/orders/${orderLeaseId}/leases`);
      if (orderLeases) {
        displayResponse('Order Leases', orderLeases);
      }
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to lease menu after action
  await displayLeaseMenu();
};