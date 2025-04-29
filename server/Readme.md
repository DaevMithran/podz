# Decentralized Compute Marketplace

A decentralized marketplace for compute resources built on Soroban smart contracts. This project enables providers to offer computing resources and tenants to rent those resources, all managed through a secure blockchain-based system.

## Features

- **Provider Registration**: Compute providers can register their resources
- **Order Placement**: Tenants can place orders for compute resources
- **Bidding System**: Providers compete on price for tenant orders
- **Container Deployment**: Automatic deployment of Docker containers
- **Health Monitoring**: Continuous monitoring of deployed containers
- **Escrow Payments**: Secure payment flow through blockchain contracts

## Architecture

The system consists of several key components:

- **Smart Contracts**: Soroban contracts for provider registry, order book, and escrow
- **API Server**: RESTful API for interacting with the marketplace
- **Service Layer**: Business logic for managing providers, orders, leases, and deployments
- **Docker Integration**: Container deployment and monitoring

## Prerequisites

- Node.js (v16+)
- Docker
- Soroban CLI
- Stellar account with testnet funds

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/decentralized-compute-marketplace.git
cd decentralized-compute-marketplace
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env` file:

```
PORT=3000
NODE_ENV=development

# Soroban configuration
SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
PROVIDER_REGISTRY_CONTRACT_ID=your_provider_registry_contract_id
ORDER_BOOK_CONTRACT_ID=your_order_book_contract_id  
ESCROW_CONTRACT_ID=your_escrow_contract_id
ADMIN_SECRET_KEY=your_admin_secret_key

# Docker configuration
DOCKER_SOCKET_PATH=/var/run/docker.sock
DOCKER_REGISTRY=docker.io
DOCKER_NETWORK=akash-network

# Monitoring configuration
HEALTH_CHECK_INTERVAL=60000
FAILURE_THRESHOLD=3

# Token configuration
NATIVE_ASSET=XLM
DEFAULT_FEE_ASSET=AKT
FEE_AMOUNT=0.0001

# Logger configuration
LOG_LEVEL=info
```

4. Deploy Soroban contracts (if not already deployed):

```bash
# Use Soroban CLI to deploy the contracts and note the contract IDs
# Update the .env file with the contract IDs
```

5. Build the project:

```bash
npm run build
```

6. Start the server:

```bash
npm start
```

## API Usage

### Provider Registration

Register a new provider:

```bash
curl -X POST http://localhost:3000/api/v1/providers \
  -H "Content-Type: application/json" \
  -d '{
    "address": "provider_stellar_address",
    "resources": {
      "cpu": 4,
      "memory": 8192,
      "storage": 100,
      "bandwidth": 1000
    },
    "hostname": "provider.example.com",
    "port": 8080
  }'
```

### Create an Order

Create a new order for compute resources:

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tenantAddress": "tenant_stellar_address",
    "maxPrice": "100",
    "specification": {
      "image": "nginx:latest",
      "cpu": 2,
      "memory": 1024,
      "storage": 10,
      "ports": [
        {
          "containerPort": 80,
          "hostPort": 8080,
          "protocol": "tcp"
        }
      ],
      "env": {
        "NGINX_HOST": "example.com"
      }
    },
    "trustLevels": ["Five", "Four"],
    "quantity": 1,
    "durationBlocks": 10000
  }'
```

### Place a Bid

Place a bid on an order:

```bash
curl -X POST http://localhost:3000/api/v1/orders/1/bids \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": 1,
    "bidPrice": "80"
  }'
```

### Accept a Bid

Accept a bid, which will create a lease and deploy the container:

```bash
curl -X PUT http://localhost:3000/api/v1/bids/1/accept
```

### Check Lease Health

Check the health of a lease:

```bash
curl -X GET http://localhost:3000/api/v1/leases/1/health
```

### More API Endpoints

See the API documentation for all available endpoints.

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with Soroban smart contracts
- Based on Akash Network's decentralized compute marketplace concept