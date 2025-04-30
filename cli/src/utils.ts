import chalk from 'chalk';

// Generate a random address for demo purposes
export const generateRandomAddress = (prefix = '') => {
  return `${prefix}${Math.floor(Math.random() * 100000)}`;
};

// Format section header
export const formatSectionHeader = (title: string) => {
  console.log(chalk.yellow('\n=================================================='));
  console.log(chalk.yellow(`| ${title.padEnd(46)} |`));
  console.log(chalk.yellow('==================================================\n'));
};

// Format sub-section header
export const formatSubSectionHeader = (title: string) => {
  console.log(chalk.blue(`\n--- ${title} ---\n`));
};

// Format step header in demo workflow
export const formatStepHeader = (step: number, description: string) => {
  console.log(chalk.yellow(`\nStep ${step}: ${description}...`));
};

// Validate input is not empty
export const validateNotEmpty = (input: any) => {
  return input.trim() !== '' ? true : 'Input cannot be empty';
};

// Validate input is a number
export const validateNumber = (input: any) => {
  return !isNaN(input) ? true : 'Must be a number';
};

// Sleep function for demo purposes
export const sleep = (ms: any) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Format error message
export const formatError = (message: any) => {
  return chalk.red(`Error: ${message}`);
};

// Format success message
export const formatSuccess = (message: any) => {
  return chalk.green(`Success: ${message}`);
};