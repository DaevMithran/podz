import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { formatSectionHeader, validateNotEmpty, validateNumber } from '../utils.js';

// Payment menu
export const displayPaymentMenu = async () => {
  formatSectionHeader('Payment Management');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select a Payment action:'),
      choices: [
        'List Payments', 
        'Get Payment Details',
        'Deposit Funds',
        'Lock Funds',
        'Withdraw Provider Earnings',
        'Get Tenant Balance',
        'Get Provider Earnings',
        'Get Payments for Lease',
        'Get Payments for Tenant',
        'Get Payments for Provider',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'List Payments':
      const payments = await callApi('get', '/payments');
      if (payments) {
        displayResponse('Payments', payments);
      }
      break;
    
    case 'Get Payment Details':
      const { paymentId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'paymentId',
          message: chalk.cyan('Enter payment ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const payment = await callApi('get', `/payments/${paymentId}`);
      if (payment) {
        displayResponse('Payment Details', payment);
      }
      break;
    
    case 'Deposit Funds':
      const depositData = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: chalk.cyan('Enter tenant address:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'amount',
          message: chalk.cyan('Enter amount to deposit:'),
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'tokenAddress',
          message: chalk.cyan('Enter token address (optional, leave empty for AKT):'),
          default: ''
        }
      ]);
      
      const deposit = await callApi('post', '/payments/deposit', {
        address: depositData.address,
        amount: parseFloat(depositData.amount),
        tokenAddress: depositData.tokenAddress || null
      });
      
      if (deposit) {
        displayResponse('Funds Deposited', deposit);
      }
      break;
    
    case 'Lock Funds':
      const lockData = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: chalk.cyan('Enter tenant address:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'amount',
          message: chalk.cyan('Enter amount to lock:'),
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'tokenAddress',
          message: chalk.cyan('Enter token address (optional, leave empty for AKT):'),
          default: ''
        }
      ]);
      
      const lock = await callApi('post', '/payments/lock', {
        address: lockData.address,
        amount: parseFloat(lockData.amount),
        tokenAddress: lockData.tokenAddress || null
      });
      
      if (lock) {
        displayResponse('Funds Locked', lock);
      }
      break;
    
    case 'Withdraw Provider Earnings':
      const withdrawData = await inquirer.prompt([
        {
          type: 'input',
          name: 'address',
          message: chalk.cyan('Enter provider address:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'tokenAddress',
          message: chalk.cyan('Enter token address (optional, leave empty for AKT):'),
          default: ''
        }
      ]);
      
      const withdraw = await callApi('post', '/payments/withdraw', {
        address: withdrawData.address,
        tokenAddress: withdrawData.tokenAddress || null
      });
      
      if (withdraw) {
        displayResponse('Provider Earnings Withdrawn', withdraw);
      }
      break;
    
    case 'Get Tenant Balance':
      const { tenantAddress } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tenantAddress',
          message: chalk.cyan('Enter tenant address:'),
          validate: validateNotEmpty
        }
      ]);
      
      const tenantBalance = await callApi('get', `/tenants/${tenantAddress}/balance`);
      if (tenantBalance) {
        displayResponse('Tenant Balance', tenantBalance);
      }
      break;
    
    case 'Get Provider Earnings':
      const { providerEarningsId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerEarningsId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const providerEarnings = await callApi('get', `/providers/${providerEarningsId}/earnings`);
      if (providerEarnings) {
        displayResponse('Provider Earnings', providerEarnings);
      }
      break;
    
    case 'Get Payments for Lease':
      const { leasePaymentId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'leasePaymentId',
          message: chalk.cyan('Enter lease ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const leasePayments = await callApi('get', `/leases/${leasePaymentId}/payments`);
      if (leasePayments) {
        displayResponse('Lease Payments', leasePayments);
      }
      break;
    
    case 'Get Payments for Tenant':
      const { tenantPaymentAddress } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tenantPaymentAddress',
          message: chalk.cyan('Enter tenant address:'),
          validate: validateNotEmpty
        }
      ]);
      
      const tenantPayments = await callApi('get', `/tenants/${tenantPaymentAddress}/payments`);
      if (tenantPayments) {
        displayResponse('Tenant Payments', tenantPayments);
      }
      break;
    
    case 'Get Payments for Provider':
      const { providerPaymentAddress } = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerPaymentAddress',
          message: chalk.cyan('Enter provider address:'),
          validate: validateNotEmpty
        }
      ]);
      
      const providerPayments = await callApi('get', `/providers/${providerPaymentAddress}/payments`);
      if (providerPayments) {
        displayResponse('Provider Payments', providerPayments);
      }
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to payment menu after action
  await displayPaymentMenu();
};