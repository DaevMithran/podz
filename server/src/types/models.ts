import { 
    TrustLevel, 
    ProviderStatus, 
    OrderState, 
    BidState, 
    LeaseState 
  } from './contracts';
  
  // Domain models for the application
  // These may extend contract types with additional fields needed by the application
  
  export interface ProviderModel {
    id: number;
    address: string;
    trustLevel: TrustLevel;
    status: ProviderStatus;
    hostname?: string; // Optional server hostname/IP
    port?: number; // Optional server port
    availableResources?: ResourceSpecification;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ResourceSpecification {
    cpu: number; // CPU cores
    memory: number; // Memory in MB
    storage: number; // Storage in GB
    bandwidth?: number; // Bandwidth in Mbps
  }
  
  export interface ContainerSpecification {
    image: string;
    cpu: number;
    memory: number;
    storage: number;
    env?: Record<string, string>;
    ports?: Array<{
      containerPort: number;
      hostPort?: number;
      protocol?: 'tcp' | 'udp';
    }>;
    volumes?: Array<{
      hostPath?: string;
      containerPath: string;
      size?: number;
    }>;
    command?: string[];
    args?: string[];
  }
  
  export interface OrderModel {
    id: number;
    tenantAddress: string;
    maxPrice: string;
    specification: ContainerSpecification;
    requiredTrustLevels: TrustLevel[];
    quantity: number;
    durationBlocks: number;
    estimatedDurationHours: number;
    state: OrderState;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface BidModel {
    id: number;
    orderId: number;
    providerId: number;
    price: string;
    state: BidState;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface LeaseModel {
    id: number;
    orderId: number;
    providerId: number;
    startBlock: number;
    endBlock: number;
    estimatedEndTime: Date;
    state: LeaseState;
    containerId?: string;
    containerIp?: string;
    accessUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface DeploymentModel {
    leaseId: number;
    orderId: number;
    providerId: number;
    containerId: string;
    imageId: string;
    status: 'pending' | 'running' | 'failed' | 'stopped';
    healthStatus: 'healthy' | 'unhealthy' | 'unknown';
    healthChecks: {
      lastCheck: Date;
      consecutiveFailures: number;
      logs: Array<{
        timestamp: Date;
        status: 'success' | 'failure';
        message: string;
      }>;
    };
    resources: {
      cpuUsage: number;
      memoryUsage: number;
      storageUsage: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface PaymentModel {
    id: number;
    leaseId: number;
    tenantAddress: string;
    providerAddress: string;
    amount: string;
    tokenAddress: string;
    status: 'pending' | 'completed' | 'failed';
    txHash?: string;
    createdAt: Date;
    updatedAt: Date;
  }