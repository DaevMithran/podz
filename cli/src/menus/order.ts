import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { formatSectionHeader, validateNotEmpty, validateNumber } from '../utils.js';

// Order menu
export const displayOrderMenu = async () => {
  formatSectionHeader('Order Management');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select an Order action:'),
      choices: [
        'List Orders', 
        'Get Order Details',
        'Create Order',
        'Close Order',
        'Get Bids for Order',
        'Place Bid',
        'Accept Bid',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'List Orders':
      const orders = await callApi('get', '/orders');
      if (orders) {
        displayResponse('Orders', orders);
      }
      break;
    
    case 'Get Order Details':
      const { orderId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'orderId',
          message: chalk.cyan('Enter order ID:'),
          validate: validateNotEmpty
        }
      ]);
      const order = await callApi('get', `/orders/${orderId}`);
      if (order) {
        displayResponse('Order Details', order);
      }
      break;
    
    case 'Create Order':
      const orderData = await inquirer.prompt([
        {
          type: 'input',
          name: 'image',
          message: chalk.cyan('Specify which image you want to deploy:'),
          default: 'nodejs:latest'
        },
        {
          type: 'input',
          name: 'cpu',
          message: chalk.cyan('Enter required CPU cores:'),
          default: '2',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'memory',
          message: chalk.cyan('Enter required memory (GB):'),
          default: '4',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'storage',
          message: chalk.cyan('Enter required storage (GB):'),
          default: '20',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'maxPrice',
          message: chalk.cyan('Enter maximum price (AKT):'),
          default: '10',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'numberOfBlocks',
          message: chalk.cyan('Enter number of blocks for lease duration:'),
          default: '1000',
          validate: validateNumber
        },
        {
          type: 'checkbox',
          name: 'trustLevels',
          message: chalk.cyan('Select acceptable trust levels:'),
          choices: ['One', 'Two', 'Three', 'Four', 'Five'],
          default: ['Three', 'Four', 'Five']
        }
      ]);

      const orderRequest = {
        specification: {
          image: orderData.image,
          cpu: parseInt(orderData.cpu),
          memory: parseInt(orderData.memory),
          storage: parseInt(orderData.storage)
        },
        maxPrice: parseInt(orderData.maxPrice),
        durationOfBlocks: parseInt(orderData.numberOfBlocks),
        trustLevels: orderData.trustLevels
      }
      
      const newOrder = await callApi('post', '/orders', orderRequest);
      
      if (newOrder) {
        displayResponse('Order Created', newOrder);
      } else {
        displayResponse('Order Created', JSON.stringify(orderRequest));
      }
      break;
    
    case 'Close Order':
      const { closeOrderId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'closeOrderId',
          message: chalk.cyan('Enter order ID to close:'),
          validate: validateNotEmpty
        }
      ]);
      
      const closedOrder = await callApi('put', `/orders/${closeOrderId}/close`);
      if (closedOrder) {
        displayResponse('Order Closed', closedOrder);
      }
      break;
    
    case 'Get Bids for Order':
      const { bidOrderId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'bidOrderId',
          message: chalk.cyan('Enter order ID:'),
          validate: validateNotEmpty
        }
      ]);
      
      const bids = await callApi('get', `/orders/${bidOrderId}/bids`);
      if (bids) {
        displayResponse('Bids for Order', bids);
      }
      break;
    
    case 'Place Bid':
      const bidData = await inquirer.prompt([
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
          name: 'bidPrice',
          message: chalk.cyan('Enter bid price (AKT):'),
          validate: validateNumber
        }
      ]);
      
      const newBid = await callApi('post', `/orders/${bidData.orderId}/bids`, {
        providerId: bidData.providerId,
        bidPrice: parseFloat(bidData.bidPrice)
      });
      
      if (newBid) {
        displayResponse('Bid Placed', newBid);
      }
      break;
    
    case 'Accept Bid':
      const { acceptBidId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'acceptBidId',
          message: chalk.cyan('Enter bid ID to accept:'),
          validate: validateNotEmpty
        }
      ]);
      
      const acceptedBid = await callApi('put', `/bids/${acceptBidId}/accept`);
      if (acceptedBid) {
        displayResponse('Bid Accepted', acceptedBid);
      }
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to order menu after action
  await displayOrderMenu();
};