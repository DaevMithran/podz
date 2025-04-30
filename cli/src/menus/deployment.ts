import inquirer from 'inquirer';
import chalk from 'chalk';
import { callApi, displayResponse } from '../api.js';
import { formatSectionHeader, validateNotEmpty } from '../utils.js';

// Deployment menu
export const displayDeploymentMenu = async () => {
  formatSectionHeader('Deployment Management');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.cyan('Select a Deployment action:'),
      choices: [
        'List Deployments', 
        'Get Deployment Details',
        'Stop Deployment',
        'Back to Main Menu'
      ]
    }
  ]);

  switch (action) {
    case 'List Deployments':
      const deployments = await callApi('get', '/deployments');
      if (deployments) {
        displayResponse('Deployments', deployments);
      }
      break;
    
    case 'Get Deployment Details':
      const { deploymentId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'deploymentId',
          message: chalk.cyan('Enter lease ID for deployment:'),
          validate: validateNotEmpty
        }
      ]);
      
      const deployment = await callApi('get', `/deployments/${deploymentId}`);
      if (deployment) {
        displayResponse('Deployment Details', deployment);
      }
      break;
    
    case 'Stop Deployment':
      const { stopDeploymentId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'stopDeploymentId',
          message: chalk.cyan('Enter lease ID for deployment to stop:'),
          validate: validateNotEmpty
        }
      ]);
      
      const stoppedDeployment = await callApi('put', `/deployments/${stopDeploymentId}/stop`);
      if (stoppedDeployment) {
        displayResponse('Deployment Stopped', stoppedDeployment);
      }
      break;
      
    case 'Back to Main Menu':
      return;
  }
  
  // Return to deployment menu after action
  await displayDeploymentMenu();
};