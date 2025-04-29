import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Stellar/Soroban configuration
  soroban: {
    networkPassphrase: process.env.SOROBAN_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    rpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
    providerRegistryId: process.env.PROVIDER_REGISTRY_CONTRACT_ID || 'CCIMLEM772X5K5V44CP7PQIAYVIOQMNOVXO5XRISDHGPLKZYNKRWRZ2Z',
    orderBookId: process.env.ORDER_BOOK_CONTRACT_ID || 'CBQV6XHOCI5IPVCSM5ODKNSELRHIKEDFVIVHYAKMJMIRIMMKUBDGCDFF',
    escrowId: process.env.ESCROW_CONTRACT_ID || '',
    signerSecretKey: process.env.ADMIN_SECRET_KEY || '',
  },
  
  // Docker configuration for deployment
  docker: {
    socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
    registry: process.env.DOCKER_REGISTRY || 'docker.io',
    networkName: process.env.DOCKER_NETWORK || 'akash-network',
  },
  
  // Monitoring configuration
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10), // Default: 1 minute
    failureThreshold: parseInt(process.env.FAILURE_THRESHOLD || '3', 10), // Number of failures before action
  },
  
  // Token configuration
  tokens: {
    nativeAsset: process.env.NATIVE_ASSET || 'XLM',
    defaultFeeAsset: process.env.DEFAULT_FEE_ASSET || 'AKT',
    feeAmount: process.env.FEE_AMOUNT || '0.0001',
  },
  
  // Logger configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;