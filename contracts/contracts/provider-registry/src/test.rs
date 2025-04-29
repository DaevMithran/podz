#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_add_provider() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create a test provider address
    let provider_address = Address::generate(&env);

    // Add a provider and check the returned ID
    let provider_id = client.add_provider(&provider_address);
    assert_eq!(provider_id, 1); // First provider should have ID 1

    // Verify we can retrieve the provider
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.address, provider_address);
    assert!(matches!(provider.trust_level, TrustLevel::Five)); // Default trust level
    assert!(matches!(provider.status, ProviderStatus::Registered)); // Default status
}

#[test]
fn test_add_multiple_providers() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create test provider addresses
    let provider_address1 = Address::generate(&env);
    let provider_address2 = Address::generate(&env);
    let provider_address3 = Address::generate(&env);

    // Add providers
    let provider_id1 = client.add_provider(&provider_address1);
    let provider_id2 = client.add_provider(&provider_address2);
    let provider_id3 = client.add_provider(&provider_address3);

    // Verify sequential IDs
    assert_eq!(provider_id1, 1);
    assert_eq!(provider_id2, 2);
    assert_eq!(provider_id3, 3);

    // Verify provider count by listing all providers
    let providers = client.list_provider();
    assert_eq!(providers.len(), 3);
}

#[test]
fn test_add_existing_provider() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create a test provider address
    let provider_address = Address::generate(&env);

    // Add a provider twice
    let provider_id1 = client.add_provider(&provider_address);
    let provider_id2 = client.add_provider(&provider_address);

    // Should return the same ID
    assert_eq!(provider_id1, provider_id2);

    // Check that there's only one provider in the list
    let providers = client.list_provider();
    assert_eq!(providers.len(), 1);
}

#[test]
fn test_set_trust_level() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create a test provider and verifier address
    let provider_address = Address::generate(&env);
    let verifier = Address::generate(&env);

    // Add a provider
    let provider_id = client.add_provider(&provider_address);

    // Set authentication for the verifier
    env.mock_all_auths();

    // Update the trust level
    client.set_trust_level(&verifier, &provider_id, &TrustLevel::Two);

    // Verify the trust level was updated
    let provider = client.get_provider(&provider_id);
    assert!(matches!(provider.trust_level, TrustLevel::Two));
}

#[test]
fn test_set_provider_status() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create a test provider and admin address
    let provider_address = Address::generate(&env);
    let admin = Address::generate(&env);

    // Add a provider
    let provider_id = client.add_provider(&provider_address);

    // Set authentication for the admin
    env.mock_all_auths();

    // Update the provider status to Active
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Active);

    // Verify the status was updated
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Active);

    // Update to Maintenance
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Maintanance);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Maintanance);

    // Update to Suspended
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Suspended);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Suspended);

    // Update to Deactivated
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Deactivated);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Deactivated);
}

#[test]
fn test_get_provider_by_address() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create test provider addresses
    let provider_address1 = Address::generate(&env);
    let provider_address2 = Address::generate(&env);

    // Add providers
    let provider_id1 = client.add_provider(&provider_address1);
    let provider_id2 = client.add_provider(&provider_address2);

    // Get provider by address
    let (id1, provider1) = client.get_provider_by_address(&provider_address1);
    let (id2, provider2) = client.get_provider_by_address(&provider_address2);

    // Verify correct IDs and addresses
    assert_eq!(id1, provider_id1);
    assert_eq!(id2, provider_id2);
    assert_eq!(provider1.address, provider_address1);
    assert_eq!(provider2.address, provider_address2);
}

#[test]
fn test_list_providers() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Initially, there should be no providers
    let providers = client.list_provider();
    assert_eq!(providers.len(), 0);

    // Create and add test provider addresses
    let provider_address1 = Address::generate(&env);
    let provider_address2 = Address::generate(&env);
    let provider_address3 = Address::generate(&env);

    client.add_provider(&provider_address1);
    client.add_provider(&provider_address2);
    client.add_provider(&provider_address3);

    // List should now contain 3 providers
    let providers = client.list_provider();
    assert_eq!(providers.len(), 3);

    // Verify each provider in the list
    assert_eq!(providers.get(0).unwrap().address, provider_address1);
    assert_eq!(providers.get(1).unwrap().address, provider_address2);
    assert_eq!(providers.get(2).unwrap().address, provider_address3);
}

#[test]
#[should_panic(expected = "Provider with ID 999 not found")]
fn test_get_nonexistent_provider() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Try to get a provider that doesn't exist
    client.get_provider(&999);
}

#[test]
#[should_panic(expected = "Provider with address not found")]
fn test_get_nonexistent_provider_by_address() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create an address that hasn't been registered
    let nonexistent_address = Address::generate(&env);

    // Try to get a provider by an address that doesn't exist in the registry
    client.get_provider_by_address(&nonexistent_address);
}

#[test]
fn test_deactivate_and_reactivate_provider() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Create a test provider and admin address
    let provider_address = Address::generate(&env);
    let admin = Address::generate(&env);

    // Add a provider
    let provider_id = client.add_provider(&provider_address);

    // Set authentication for the admin
    env.mock_all_auths();

    // Deactivate the provider
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Deactivated);

    // Verify the status
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Deactivated);

    // Reactivate the provider
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Active);

    // Verify the status
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Active);
}

#[test]
fn test_full_provider_lifecycle() {
    let env = Env::default();
    let contract_id = env.register(ProviderRegistryContract, {});
    let client = ProviderRegistryContractClient::new(&env, &contract_id);

    // Generate addresses
    let provider_address = Address::generate(&env);
    let admin = Address::generate(&env);

    // Enable authentication
    env.mock_all_auths();

    // 1. Register provider
    let provider_id = client.add_provider(&provider_address);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Registered);
    assert!(matches!(provider.trust_level, TrustLevel::Five));

    // 2. Activate provider
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Active);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Active);

    // 3. Upgrade trust level
    client.set_trust_level(&admin, &provider_id, &TrustLevel::One);
    let provider = client.get_provider(&provider_id);
    assert!(matches!(provider.trust_level, TrustLevel::One));

    // 4. Put into maintenance
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Maintanance);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Maintanance);

    // 5. Reactivate
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Active);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Active);

    // 6. Suspend (e.g., for poor performance)
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Suspended);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Suspended);

    // 7. Deactivate permanently
    client.set_provider_status(&admin, &provider_id, &ProviderStatus::Deactivated);
    let provider = client.get_provider(&provider_id);
    assert_eq!(provider.status, ProviderStatus::Deactivated);

    // Check that provider is still in the list
    let providers = client.list_provider();
    assert_eq!(providers.len(), 1);
}
