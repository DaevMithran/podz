// Enum types matching the contract definitions
export enum TrustLevel {
    One = 'One',
    Two = 'Two',
    Three = 'Three',
    Four = 'Four',
    Five = 'Five',
  }
  
  export enum ProviderStatus {
    Registered = 'Registered',
    Active = 'Active',
    Maintanance = 'Maintanance', // Note: Typo is preserved from the contract
    Suspended = 'Suspended',
    Deactivated = 'Deactivated',
  }
  
  export enum OrderState {
    Active = 'Active',
    Closed = 'Closed',
    Complete = 'Complete',
  }
  
  export enum BidState {
    Active = 'Active',
    Canceled = 'Canceled',
    Matched = 'Matched',
  }
  
  export enum LeaseState {
    Active = 'Active',
    Canceled = 'Canceled',
    Completed = 'Completed',
  }
  
  // Provider Registry Contract Interfaces
  export interface Provider {
    address: string;
    trust_level: TrustLevel;
    status: ProviderStatus;
  }
  
  // OrderBook Contract Interfaces
  export interface Specification {
    spec: string;
    trust_levels: TrustLevel[];
    quantity: number;
    max_price: string; // Using string for large numbers
  }
  
  export interface OrderRequest {
    max_price: string; // Using string for large numbers
    state: OrderState;
    spec: Specification;
    number_of_blocks: number;
  }
  
  export interface ProviderBid {
    order_id: number;
    provider: number;
    bid_price: string; // Using string for large numbers
    state: BidState;
  }
  
  export interface Lease {
    order_id: number;
    provider_id: number;
    start_block: number;
    end_block: number;
    state: LeaseState;
  }
  
  // Escrow Contract Interfaces
  export interface Tenant {
    locked_balance: string; // Using string for large numbers
    unlocked_balance: string; // Using string for large numbers
  }
  
  export interface ProviderToken {
    earned: string; // Using string for large numbers
    withdrawn: string; // Using string for large numbers
    balance: string; // Using string for large numbers
  }