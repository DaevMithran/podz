import inquirer from 'inquirer';
import chalk from 'chalk';
import { displayTitle } from '../index.js';
import { displayProviderMenu } from './provider.js';
import { displayOrderMenu } from './order.js';
import { displayLeaseMenu } from './lease.js';
import { displayDeploymentMenu } from './deployment.js';
import { displayPaymentMenu } from './payment.js';
import { displayDemoWorkflowMenu } from './demo.js';

// Main menu
export const displayMainMenu = async () => {
  const { section } = await inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: chalk.cyan('Select a section to explore:'),
      choices: [
        'Providers', 
        'Orders', 
        'Leases',
        'Deployments',
        'Payments',
        'Demo Workflows',
        'Exit'
      ]
    }
  ]);

  switch (section) {
    case 'Providers':
      await displayProviderMenu();
      break;
    case 'Orders':
      await displayOrderMenu();
      break;
    case 'Leases':
      await displayLeaseMenu();
      break;
    case 'Deployments':
      await displayDeploymentMenu();
      break;
    case 'Payments':
      await displayPaymentMenu();
      break;
    case 'Demo Workflows':
      await displayDemoWorkflowMenu();
      break;
    case 'Exit':
      console.log(chalk.green('Thank you for using PodZ CLI Demo. Goodbye!'));
      process.exit(0);
  }
  
  // Refresh title and return to main menu
  displayTitle();
  await displayMainMenu();
};