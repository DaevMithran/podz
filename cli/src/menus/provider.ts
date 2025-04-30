import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { formatSectionHeader, validateNotEmpty, validateNumber } from '../utils.js';

// Provider menu
export const displayProviderMenu = async () => {
  formatSectionHeader('Provider Management');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select a Provider action:'),
      choices: [
        'List Providers', 
        'Get Provider Details', 
        'Register Provider', 
        'Update Provider Status',
        'Update Provider Trust Level',
        'Update Provider Resources',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'List Providers':
      const providers = await callApi('get', '/providers');
      if (providers) {
        displayResponse('Providers', providers);
      }
      break;
    
    case 'Get Provider Details':
      const { providerId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        }
      ]);
      const provider = await callApi('get', `/providers/${providerId}`);
      if (provider) {
        displayResponse('Provider Details', provider);
      }
      break;
    
    case 'Register Provider':
      const providerData = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: chalk.cyan('Enter provider name:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'cpu',
          message: chalk.cyan('Enter available CPU cores:'),
          default: '4',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'memory',
          message: chalk.cyan('Enter available memory (GB):'),
          default: '8',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'storage',
          message: chalk.cyan('Enter available storage (GB):'),
          default: '100',
          validate: validateNumber
        }
      ]);
      
      const newProvider = await callApi('post', '/providers', {
        name: providerData.name,
        resources: {
          cpu: parseInt(providerData.cpu),
          memory: parseInt(providerData.memory),
          storage: parseInt(providerData.storage)
        }
      });
      
      if (newProvider) {
        displayResponse('Provider Registered', newProvider);
      }
      break;
    
    case 'Update Provider Status':
      const statusUpdate = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'list',
          name: 'status',
          message: chalk.cyan('Select provider status:'),
          choices: ['Registered', 'Active', 'Maintanance', 'Suspended', 'Deactivated']
        }
      ]);
      
      const updatedStatus = await callApi('put', `/providers/${statusUpdate.providerId}/status`, { status: statusUpdate.status });
      if (updatedStatus) {
        displayResponse('Provider Status Updated', updatedStatus);
      }
      break;
    
    case 'Update Provider Trust Level':
      const trustUpdate = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'list',
          name: 'trustLevel',
          message: chalk.cyan('Select trust level:'),
          choices: ['One', 'Two', 'Three', 'Four', 'Five']
        }
      ]);
      
      const updatedTrust = await callApi('put', `/providers/${trustUpdate.providerId}/trust-level`, { trustLevel: trustUpdate.trustLevel });
      if (updatedTrust) {
        displayResponse('Provider Trust Level Updated', updatedTrust);
      }
      break;
    
    case 'Update Provider Resources':
      const resourceUpdate = await inquirer.prompt([
        {
          type: 'input',
          name: 'providerId',
          message: chalk.cyan('Enter provider ID:'),
          validate: validateNotEmpty
        },
        {
          type: 'input',
          name: 'cpu',
          message: chalk.cyan('Enter available CPU cores:'),
          default: '4',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'memory',
          message: chalk.cyan('Enter available memory (GB):'),
          default: '8',
          validate: validateNumber
        },
        {
          type: 'input',
          name: 'storage',
          message: chalk.cyan('Enter available storage (GB):'),
          default: '100',
          validate: validateNumber
        }
      ]);
      
      const updatedResources = await callApi('put', `/providers/${resourceUpdate.providerId}/resources`, { 
        resources: {
          cpu: parseInt(resourceUpdate.cpu),
          memory: parseInt(resourceUpdate.memory),
          storage: parseInt(resourceUpdate.storage)
        }
      });
      
      if (updatedResources) {
        displayResponse('Provider Resources Updated', updatedResources);
      }
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to provider menu after action
  await displayProviderMenu();
};