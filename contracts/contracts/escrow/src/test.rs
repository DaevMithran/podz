#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};
use token::Client as TokenClient;
use token::StellarAssetClient as TokenAdminClient;

use provider_registry;

mod test_provider_registry {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32-unknown-unknown/release/provider_registry.wasm",
    );
}

// Helper function to create a mock token contract
fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(e, &sac.address()),
        token::StellarAssetClient::new(e, &sac.address()),
    )
}

// Helper function to setup a mock provider registry
fn setup_provider_registry(e: &Env) -> (Address, test_provider_registry::Client) {
    let contract_id = e.register(provider_registry::ProviderRegistryContract, {});
    let client = test_provider_registry::Client::new(e, &contract_id);
    (contract_id, client)
}

#[test]
fn test_constructor() {
    let env = Env::default();
    let (provider_registry_id, _) = setup_provider_registry(&env);

    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    assert_eq!(provider_registry_id, client.get_provider_registry());
}

#[test]
fn test_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint some tokens for the user
    token_admin.mint(&user, &1000);

    // Deposit tokens
    let amount = 500;

    client.deposit(&token_id, &user, &amount);

    // Verify the deposit was recorded correctly
    let balance: Tenant = client.get_tenant_balance(&token.address, &user);

    assert_eq!(balance.unlocked_balance, 500);
    assert_eq!(balance.locked_balance, 0);

    // Verify token transfer
    assert_eq!(token.balance(&user), 500);
    assert_eq!(token.balance(&contract_id), 500);
}

#[test]
fn test_withdraw() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens directly to the user
    token_admin.mint(&user, &1000);

    // Withdraw tokens
    let amount = 300;
    client.deposit(&token_id, &user, &amount);
    client.withdraw(&token_id, &user, &amount);

    // Verify the withdrawal was recorded correctly
    let balance: Tenant = client.get_tenant_balance(&token_id, &user);

    assert_eq!(balance.unlocked_balance, 0);
    assert_eq!(balance.locked_balance, 0);

    // Verify token transfer
    assert_eq!(token.balance(&user), 1000);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
#[should_panic]
fn test_withdraw_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens to the user and deposit some
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &200);

    // Try to withdraw more than available
    let amount = 300;
    client.withdraw(&token_id, &user, &amount);
}

#[test]
fn test_lock_tokens() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens to the user and deposit
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &500);

    // Lock tokens
    let amount = 300;
    client.lock(&token_id, &user, &amount);

    // Verify the lock was recorded correctly
    let balance = client.get_tenant_balance(&token_id, &user);

    assert_eq!(balance.unlocked_balance, 200);
    assert_eq!(balance.locked_balance, 300);
}

#[test]
#[should_panic]
fn test_lock_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens to the user and deposit some
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &200);

    // Try to lock more than available
    let amount = 300;
    client.lock(&token_id, &user, &amount);
}

#[test]
fn test_unlock_tokens() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens to the user, deposit and lock some
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &700);
    client.lock(&token_id, &user, &500);

    // Unlock tokens
    let amount = 300;
    client.unlock_tokens(&token_id, &user, &amount);

    // Verify the unlock was recorded correctly
    let balance = client.get_tenant_balance(&token_id, &user);

    assert_eq!(balance.unlocked_balance, 500);
    assert_eq!(balance.locked_balance, 200);
}

#[test]
#[should_panic]
fn test_unlock_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user
    let user = Address::generate(&env);

    // Mint tokens to the user, deposit and lock some
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &500);
    client.lock(&token_id, &user, &200);

    // Try to unlock more than locked
    let amount = 300;
    client.unlock_tokens(&token_id, &user, &amount);
}

#[test]
fn test_transfer_locked() {
    let env = Env::default();
    env.mock_all_auths();

    let (provider_registry_id, _) = setup_provider_registry(&env);

    // Create token contract
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    let token_id = token.address.clone();

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Setup user and provider
    let user = Address::generate(&env);
    let provider_id = 42u64; // Arbitrary provider ID

    // Mint tokens to the user, deposit and lock some
    token_admin_client.mint(&user, &1000);
    client.deposit(&token_id, &user, &700);
    client.lock(&token_id, &user, &500);

    // Transfer locked tokens
    let amount = 300;
    client.transfer_locked(&token_id, &user, &amount, &provider_id);

    // Verify the transfer was recorded correctly for the user
    let user_balance = client.get_tenant_balance(&token_id, &user);

    assert_eq!(user_balance.unlocked_balance, 200);
    assert_eq!(user_balance.locked_balance, 200);

    // Verify the provider earnings
    //Note: This assumes there's a get_provider_earnings method in the contract
    let provider_earnings = client.get_provider_earnings(&provider_id, &token_id);

    assert_eq!(provider_earnings.earned, 300);
    assert_eq!(provider_earnings.withdrawn, 0);
    assert_eq!(provider_earnings.balance, 300); // This should be updated accordingly
}

#[test]
fn test_update_provider_registry() {
    let env = Env::default();
    let (old_provider_registry_id, _) = setup_provider_registry(&env);

    // Create escrow contract
    let contract_id = env.register(EscrowContract, (&old_provider_registry_id,));
    let client = EscrowContractClient::new(&env, &contract_id);

    // Create new provider registry
    let (new_provider_registry_id, _) = setup_provider_registry(&env);

    // Update provider registry
    client.update_provider_registry(&new_provider_registry_id);

    // Verify the update
    let stored_provider_registry = client.get_provider_registry();

    assert_eq!(stored_provider_registry, new_provider_registry_id);
}

// #[test]
// fn test_withdraw_provider_earnings() {
//     let env = Env::default();
//     env.mock_all_auths();

//     // Setup provider registry and add a provider
//     let (provider_registry_id, provider_registry_client) = setup_provider_registry(&env);
//     let provider_address = Address::generate(&env);
//     let provider_id = provider_registry_client.add_provider(&provider_address);

//     // Create token contract
//     let token_admin = Address::generate(&env);
//     let (token, token_admin_client) = create_token_contract(&env, &token_admin);
//     let token_id = token.address.clone();

//     // Create escrow contract
//     let contract_id = env.register(EscrowContract, (&provider_registry_id,));
//     let client = EscrowContractClient::new(&env, &contract_id);

//     // Setup user and add funds
//     let user = Address::generate(&env);
//     token_admin_client.mint(&user, &1000);
//     client.deposit(&token_id, &user, &700);
//     client.lock(&token_id, &user, &500);

//     // Transfer locked tokens to provider
//     let amount = 300;
//     client.transfer_locked(&token_id, &user, &amount, &provider_id);

//     // Check balance before withdrawal
//     let before_provider_balance = token.balance(&provider_address);
//     let before_contract_balance = token.balance(&contract_id);

//     // Provider withdraws earnings
//     client.withdraw_provider_earnings(&provider_address, &token_id);

//     // Verify token transfer
//     let after_provider_balance = token.balance(&provider_address);
//     let after_contract_balance = token.balance(&contract_id);

//     assert_eq!(after_provider_balance - before_provider_balance, 300);
//     assert_eq!(before_contract_balance - after_contract_balance, 300);

//     // Verify provider earnings record is updated
//     let updated_earnings = client.get_provider_earnings(&provider_id, &token_id);
//     assert_eq!(updated_earnings.withdrawn, 300);
//     assert_eq!(updated_earnings.balance, 0);
// }

// #[test]
// fn test_full_escrow_lifecycle() {
//     let env = Env::default();
//     env.mock_all_auths();

//     // Setup provider registry and add a provider
//     let (provider_registry_id, provider_registry_client) = setup_provider_registry(&env);
//     let provider_address = Address::generate(&env);
//     let provider_id = provider_registry_client.add_provider(&provider_address);

//     // Create token contract
//     let token_admin = Address::generate(&env);
//     let (token, token_admin_client) = create_token_contract(&env, &token_admin);
//     let token_id = token.address.clone();

//     // Create escrow contract
//     let contract_id = env.register(EscrowContract, (&provider_registry_id,));
//     let client = EscrowContractClient::new(&env, &contract_id);

//     // 1. Setup user with tokens
//     let user = Address::generate(&env);
//     token_admin_client.mint(&user, &1000);

//     // 2. User deposits tokens to escrow
//     client.deposit(&token_id, &user, &800);

//     // Verify deposit
//     let balance_after_deposit = client.get_tenant_balance(&token_id, &user);
//     assert_eq!(balance_after_deposit.unlocked_balance, 800);
//     assert_eq!(balance_after_deposit.locked_balance, 0);

//     // 3. User locks tokens for computing services
//     client.lock(&token_id, &user, &500);

//     // Verify lock
//     let balance_after_lock = client.get_tenant_balance(&token_id, &user);
//     assert_eq!(balance_after_lock.unlocked_balance, 300);
//     assert_eq!(balance_after_lock.locked_balance, 500);

//     // 4. User transfers locked tokens to provider for services
//     client.transfer_locked(&token_id, &user, &250, &provider_id);

//     // Verify transfer
//     let balance_after_transfer = client.get_tenant_balance(&token_id, &user);
//     assert_eq!(balance_after_transfer.unlocked_balance, 300);
//     assert_eq!(balance_after_transfer.locked_balance, 250);

//     // Initialize provider earnings in storage
//     let provider_earnings = ProviderToken {
//         earned: 250,
//         withdrawn: 0,
//         balance: 250,
//     };
//     env.storage().instance().set(
//         &DataKey::ProviderEarnings(provider_id, token_id.clone()),
//         &provider_earnings,
//     );

//     // 5. Provider withdraws earnings
//     client.withdraw_provider_earnings(&provider_address, &token_id);

//     // Verify provider received tokens
//     assert_eq!(token.balance(&provider_address), 250);

//     // 6. User unlocks remaining tokens
//     client.unlock_tokens(&token_id, &user, &150);

//     // Verify unlock
//     let balance_after_unlock = client.get_tenant_balance(&token_id, &user);
//     assert_eq!(balance_after_unlock.unlocked_balance, 450);
//     assert_eq!(balance_after_unlock.locked_balance, 100);

//     // 7. User withdraws unlocked tokens
//     client.withdraw(&token_id, &user, &400);

//     // Verify withdrawal
//     let balance_after_withdrawal = client.get_tenant_balance(&token_id, &user);
//     assert_eq!(balance_after_withdrawal.unlocked_balance, 50);
//     assert_eq!(balance_after_withdrawal.locked_balance, 100);

//     // Verify final token balances
//     assert_eq!(token.balance(&user), 600); // 1000 initial - 800 deposit + 400 withdraw
//     assert_eq!(token.balance(&contract_id), 350); // 800 deposit - 250 to provider - 400 to user
//     assert_eq!(token.balance(&provider_address), 250);
// }

// Note: We're not testing withdraw_provider_earnings since it requires
// mocking the provider_registry::get_provider_by_address function,
// which is more complex to setup
