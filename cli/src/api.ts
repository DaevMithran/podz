import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import stringify from 'json-stringify-pretty-compact';
import { config } from 'dotenv'

config()

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Configure axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to make API calls with loading spinner
export const callApi = async (method: any, endpoint: any, data: any = null) => {
  const spinner = ora(`Calling ${method.toUpperCase()} ${endpoint}...`).start();
  try {
    let response: any;
    if (method.toLowerCase() === 'get') {
      response = await api.get(endpoint);
    } else if (method.toLowerCase() === 'post') {
      response = await api.post(endpoint, data);
    } else if (method.toLowerCase() === 'put') {
      response = await api.put(endpoint, data);
    } else if (method.toLowerCase() === 'delete') {
      response = await api.delete(endpoint);
    }
    spinner.succeed(`${method.toUpperCase()} ${endpoint} completed`);
    return response.data;
  } catch (error: any) {
    spinner.fail(`Error: ${error.message}`);
    if (error.response) {
    //   console.log(chalk.red(`Status: ${error.response.status}`));
    //   console.log(chalk.red(`Response: ${JSON.stringify(error.response.data)}`));
    }
    return null;
  }
};

// Helper function to display API response
export const displayResponse = (title: string, data: string) => {
  console.log(chalk.green(`${title}:`));
  console.log(chalk.green(stringify(data, { maxLength: 80 })));
};