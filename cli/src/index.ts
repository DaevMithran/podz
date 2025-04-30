#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { config } from 'dotenv';
import { callApi } from './api.js';
import { displayMainMenu } from './menus/index.js';

// Load environment variables
config();

// Display title
export const displayTitle = () => {
  console.log(
    chalk.cyan(
      figlet.textSync('PodZ CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.blue('Decentralized Compute Marketplace Platform'));
  console.log(chalk.gray('-------------------------------------------'));
};

// Start the application
const run = async () => {
  try {
    displayTitle();
    
    // Check API connection
    console.log(chalk.yellow('Connecting to PodZ API...'));
    const healthCheck = await callApi('get', '/health');
    if (!healthCheck) {
      console.log(chalk.red('Could not connect to PodZ API. Please check that the server is running.'));
      process.exit(1);
    }
    console.log(chalk.green('Connected to PodZ API successfully!'));
    
    await displayMainMenu();
  } catch (error) {
    console.error(chalk.red('An error occurred:'), error);
    process.exit(1);
  }
};

// Handle keyboard interrupts
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nGracefully shutting down. Goodbye!'));
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUncaught Exception:'), error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\nUnhandled Promise Rejection:'), reason);
  process.exit(1);
});

// Start the application
run();