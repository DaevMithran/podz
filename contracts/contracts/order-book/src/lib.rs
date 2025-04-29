#![no_std]
use core::panic;

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contract]
pub struct OrderBookContract;

// Orders
#[contracttype]
pub struct OrderRequest {
    max_price: u128,
    state: OrderState,
    spec: Specification,
    number_of_blocks: u32,
}

#[contracttype]
struct Specification {
    spec: String,
    trust_levels: Vec<TrustLevel>,
    quantity: u64,
    max_price: u128,
}

#[contracttype]
pub enum OrderState {
    Active,
    Closed,
    Complete,
}

#[contracttype]
#[derive(Debug, Clone)]
pub enum TrustLevel {
    One,
    Two,
    Three,
    Four,
    Five,
}

// Bids
#[contracttype]
enum BidState {
    Active,
    Canceled,
    Matched,
}

#[contracttype]
struct ProviderBid {
    order_id: u64,
    provider: u64,
    bid_price: u128,
    state: BidState,
}

// storage
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    OrderCount,
    BidCount,
    LeaseCount,
}

#[contracttype]
pub enum OrderRequests {
    Id(u64),
    ProviderOrder(u64),
}

#[contracttype]
pub enum BidStates {
    Bids(u64),
    ProviderBids(Address),
    Leases(u64),
}

// Lease
#[contracttype]
pub struct Lease {
    order_id: u64,
    provider_id: u64,
    start_block: u32,
    end_block: u32,
    state: LeaseState,
    container: Option<String>,
}

#[contracttype]
pub enum LeaseState {
    Initiate,
    Active,
    Canceled,
    Completed,
}

#[contractimpl]
impl OrderBookContract {
    pub fn create_order(
        env: Env,
        max_price: u128,
        number_of_blocks: u32,
        quantity: u64,
        spec: String,
        trust_levels: Vec<TrustLevel>,
    ) -> u64 {
        let order_request = OrderRequest {
            max_price,
            state: OrderState::Active,
            spec: Specification {
                spec,
                trust_levels,
                quantity,
                max_price,
            },
            number_of_blocks,
        };

        let mut order_count = env
            .storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0);

        order_count += 1;

        // add order
        env.storage()
            .instance()
            .set(&OrderRequests::Id(order_count), &order_request);

        // update order count
        env.storage()
            .instance()
            .set(&DataKey::OrderCount, &order_count);

        order_count
    }

    fn update_order_to_complete(
        env: Env,
        order_id: u64,
        provider_id: u64,
        amount: u128,
    ) -> OrderRequest {
        let mut order: OrderRequest = env
            .storage()
            .instance()
            .get(&OrderRequests::Id(order_id))
            .unwrap_or_else(|| panic!("Order with ID {} not found", order_id));

        order.state = OrderState::Complete;
        order.max_price = amount;

        env.storage().instance().update(
            &OrderRequests::ProviderOrder(provider_id),
            |opt_orders: Option<Vec<u64>>| {
                let mut orders = opt_orders.unwrap_or(Vec::new(&env));
                orders.push_back(order_id);
                orders
            },
        );

        env.storage()
            .instance()
            .set(&OrderRequests::Id(order_id), &order);
        order
    }

    pub fn update_order_to_closed(env: Env, order_id: u64) {
        let mut order: OrderRequest = env
            .storage()
            .instance()
            .get(&OrderRequests::Id(order_id))
            .unwrap_or_else(|| panic!("Order with ID {} not found", order_id));

        order.state = OrderState::Closed;

        env.storage()
            .instance()
            .set(&OrderRequests::Id(order_id), &order);
    }

    pub fn get_order(env: Env, order_id: u64) -> OrderRequest {
        env.storage()
            .instance()
            .get(&OrderRequests::Id(order_id))
            .unwrap_or_else(|| panic!("Order with ID {} not found", order_id))
    }

    pub fn list_orders(env: Env) -> Vec<OrderRequest> {
        let mut orders = Vec::new(&env);
        let order_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0);

        for i in 1..=order_count {
            if let Some(order) = env.storage().instance().get(&OrderRequests::Id(i)) {
                orders.push_back(order);
            }
        }

        orders
    }

    pub fn place_bid(env: Env, order_id: u64, provider: u64, bid_price: u128) -> u64 {
        let mut bid_count = env
            .storage()
            .instance()
            .get(&DataKey::BidCount)
            .unwrap_or(0);

        let order: OrderRequest = env
            .storage()
            .instance()
            .get(&OrderRequests::Id(order_id))
            .unwrap_or_else(|| panic!("Order with ID {} not found", order_id));

        if order.max_price < bid_price {
            panic!("Bid price exceeds max price");
        }

        bid_count += 1;

        let bid = ProviderBid {
            order_id,
            provider,
            bid_price,
            state: BidState::Active,
        };

        env.storage()
            .instance()
            .set(&BidStates::Bids(bid_count), &bid);
        env.storage().instance().set(&DataKey::BidCount, &bid_count);

        bid_count
    }

    pub fn accept_bid(env: Env, bid_id: u64) {
        let mut bid: ProviderBid = env
            .storage()
            .instance()
            .get(&BidStates::Bids(bid_id))
            .unwrap_or_else(|| panic!("Bid with ID {} not found", bid_id));

        bid.state = BidState::Matched;

        env.storage().instance().set(&BidStates::Bids(bid_id), &bid);

        let order = OrderBookContract::update_order_to_complete(
            env.clone(),
            bid.order_id,
            bid.provider,
            bid.bid_price,
        );
        // current block number
        let start_block = env.ledger().sequence();
        OrderBookContract::create_lease(
            env,
            bid.order_id,
            bid.provider,
            start_block,
            start_block + order.number_of_blocks,
        );
    }

    fn create_lease(
        env: Env,
        order_id: u64,
        provider_id: u64,
        start_block: u32,
        end_block: u32,
    ) -> Lease {
        let lease = Lease {
            order_id,
            provider_id,
            start_block,
            end_block,
            state: LeaseState::Active,
            container: None,
        };

        let mut lease_count = env
            .storage()
            .instance()
            .get(&DataKey::OrderCount)
            .unwrap_or(0);

        lease_count += 1;

        env.storage()
            .instance()
            .set(&BidStates::Leases(lease_count), &lease);

        lease
    }
}

mod test;
