#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Ledger, vec, Env};

#[test]
fn test_create_order() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Create trust levels
    let trust_levels = vec![&env, TrustLevel::One, TrustLevel::Two];

    // Create order
    let order_id = client.create_order(
        &100_000, // max_price
        &1000,    // number_of_blocks
        &5,       // quantity
        &String::from_str(&env, "cpu:4,memory:8G,storage:100G"),
        &trust_levels,
    );

    assert_eq!(order_id, 1); // First order should have ID 1

    // Verify order details
    let order = client.get_order(&order_id);
    assert_eq!(order.max_price, 100_000);
    assert_eq!(order.number_of_blocks, 1000);
    assert!(matches!(order.state, OrderState::Active));

    // Check specification
    assert_eq!(order.spec.quantity, 5);
    assert_eq!(order.spec.max_price, 100_000);
    assert_eq!(
        order.spec.spec,
        String::from_str(&env, "cpu:4,memory:8G,storage:100G")
    );
    assert_eq!(order.spec.trust_levels.len(), 2);
}

#[test]
fn test_create_multiple_orders() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    let trust_levels = vec![&env, TrustLevel::Three];

    // Create first order
    let order_id1 = client.create_order(
        &50_000,
        &500,
        &2,
        &String::from_str(&env, "cpu:2,memory:4G,storage:50G"),
        &trust_levels,
    );

    // Create second order
    let order_id2 = client.create_order(
        &75_000,
        &750,
        &3,
        &String::from_str(&env, "cpu:3,memory:6G,storage:75G"),
        &trust_levels,
    );

    // Create third order
    let order_id3 = client.create_order(
        &100_000,
        &1000,
        &4,
        &String::from_str(&env, "cpu:4,memory:8G,storage:100G"),
        &trust_levels,
    );

    // Check order IDs
    assert_eq!(order_id1, 1);
    assert_eq!(order_id2, 2);
    assert_eq!(order_id3, 3);

    // Check order count by listing orders
    let orders = client.list_orders();
    assert_eq!(orders.len(), 3);
}

#[test]
fn test_update_order_to_closed() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    let trust_levels = vec![&env, TrustLevel::Four];

    // Create order
    let order_id = client.create_order(
        &60_000,
        &600,
        &3,
        &String::from_str(&env, "cpu:3,memory:6G,storage:60G"),
        &trust_levels,
    );

    // Verify initial state
    let order = client.get_order(&order_id);
    assert!(matches!(order.state, OrderState::Active));

    // Update order to closed
    client.update_order_to_closed(&order_id);

    // Verify updated state
    let updated_order = client.get_order(&order_id);
    assert!(matches!(updated_order.state, OrderState::Closed));
}

#[test]
fn test_place_bid() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    let trust_levels = vec![&env, TrustLevel::Five];

    // Create order
    let order_id = client.create_order(
        &80_000,
        &800,
        &4,
        &String::from_str(&env, "cpu:4,memory:8G,storage:80G"),
        &trust_levels,
    );

    // Place bid
    let provider_id = 42; // Mock provider ID
    let bid_price = 70_000;
    let bid_id = client.place_bid(&order_id, &provider_id, &bid_price);

    assert_eq!(bid_id, 1); // First bid should have ID 1
}

#[test]
fn test_place_multiple_bids() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    let trust_levels = vec![&env, TrustLevel::Two];

    // Create order
    let order_id = client.create_order(
        &90_000,
        &900,
        &4,
        &String::from_str(&env, "cpu:4,memory:8G,storage:90G"),
        &trust_levels,
    );

    // Place multiple bids
    let bid_id1 = client.place_bid(&order_id, &101, &85_000);
    let bid_id2 = client.place_bid(&order_id, &102, &82_000);
    let bid_id3 = client.place_bid(&order_id, &103, &80_000);

    // Check bid IDs
    assert_eq!(bid_id1, 1);
    assert_eq!(bid_id2, 2);
    assert_eq!(bid_id3, 3);
}

#[test]
#[should_panic(expected = "Order with ID 999 not found")]
fn test_place_bid_invalid_order() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Try to place a bid on a non-existent order
    client.place_bid(&999, &1, &50_000);
}

#[test]
fn test_accept_bid() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Mock the current block number
    let mut ledger = env.ledger().get();
    ledger.sequence_number = 100;
    ledger.timestamp = 12345;
    env.ledger().set(ledger);

    let trust_levels = vec![&env, TrustLevel::One];

    // Create order
    let order_id = client.create_order(
        &70_000,
        &700,
        &3,
        &String::from_str(&env, "cpu:3,memory:6G,storage:70G"),
        &trust_levels,
    );

    // Place bid
    let provider_id = 201;
    let bid_price = 65_000;
    let bid_id = client.place_bid(&order_id, &provider_id, &bid_price);

    // Accept bid
    client.accept_bid(&bid_id);

    // Verify order state has changed to complete
    let order = client.get_order(&order_id);
    assert!(matches!(order.state, OrderState::Complete));

    // The max_price field should be updated to the accepted bid price
    assert_eq!(order.max_price, bid_price);

    // Note: Ideally we would verify the lease was created, but the contract doesn't
    // provide a method to retrieve lease information
}

#[test]
fn test_full_order_lifecycle() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Mock the current block number
    let mut ledger = env.ledger().get();
    ledger.sequence_number = 500;
    ledger.timestamp = 12345;

    // Create trust levels
    let trust_levels = vec![&env, TrustLevel::One, TrustLevel::Two];

    // 1. Create an order
    let order_id = client.create_order(
        &100_000,
        &1000,
        &5,
        &String::from_str(&env, "cpu:4,memory:8G,storage:100G"),
        &trust_levels,
    );

    let order = client.get_order(&order_id);
    assert!(matches!(order.state, OrderState::Active));

    // 2. Place multiple bids
    client.place_bid(&order_id, &301, &95_000);
    client.place_bid(&order_id, &302, &90_000);
    let bid_id3 = client.place_bid(&order_id, &303, &85_000); // Lowest price

    // 3. Accept the lowest bid
    client.accept_bid(&bid_id3);

    // 4. Verify order state changed to complete
    let updated_order = client.get_order(&order_id);
    assert!(matches!(updated_order.state, OrderState::Complete));
    assert_eq!(updated_order.max_price, 85_000); // Should be updated to the accepted bid price

    // 5. Create another order
    let order_id2 = client.create_order(
        &120_000,
        &1200,
        &6,
        &String::from_str(&env, "cpu:6,memory:12G,storage:120G"),
        &trust_levels,
    );

    // 6. Close this order without accepting any bids
    client.update_order_to_closed(&order_id2);

    let closed_order = client.get_order(&order_id2);
    assert!(matches!(closed_order.state, OrderState::Closed));
}

#[test]
fn test_list_orders() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Initially, there should be no orders
    let orders = client.list_orders();
    assert_eq!(orders.len(), 0);

    let trust_levels = vec![&env, TrustLevel::Three];

    // Create several orders
    client.create_order(
        &50_000,
        &500,
        &2,
        &String::from_str(&env, "cpu:2,memory:4G"),
        &trust_levels,
    );

    client.create_order(
        &60_000,
        &600,
        &3,
        &String::from_str(&env, "cpu:3,memory:6G"),
        &trust_levels,
    );

    client.create_order(
        &70_000,
        &700,
        &4,
        &String::from_str(&env, "cpu:4,memory:8G"),
        &trust_levels,
    );

    // List should now contain 3 orders
    let orders = client.list_orders();
    assert_eq!(orders.len(), 3);

    // Verify details of each order
    assert_eq!(orders.get(0).unwrap().max_price, 50_000);
    assert_eq!(orders.get(1).unwrap().max_price, 60_000);
    assert_eq!(orders.get(2).unwrap().max_price, 70_000);

    // Close an order
    client.update_order_to_closed(&2);

    // List should still contain 3 orders, but one should be closed
    let updated_orders = client.list_orders();
    assert_eq!(updated_orders.len(), 3);
    assert!(matches!(
        updated_orders.get(1).unwrap().state,
        OrderState::Closed
    ));
}

#[test]
#[should_panic(expected = "Order with ID 999 not found")]
fn test_get_nonexistent_order() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Try to get an order that doesn't exist
    client.get_order(&999);
}

#[test]
#[should_panic(expected = "Order with ID 999 not found")]
fn test_update_nonexistent_order() {
    let env = Env::default();
    let contract_id = env.register(OrderBookContract, {});
    let client = OrderBookContractClient::new(&env, &contract_id);

    // Try to update an order that doesn't exist
    client.update_order_to_closed(&999);
}
