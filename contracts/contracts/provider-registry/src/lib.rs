#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contract]
pub struct ProviderRegistryContract;

// storage
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Providers,
    ProviderCount,
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

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub enum ProviderStatus {
    Registered,
    Active,
    Maintanance,
    Suspended,
    Deactivated,
}

#[contracttype]
#[derive(Debug, Clone)]
pub struct Provider {
    address: Address,
    trust_level: TrustLevel,
    status: ProviderStatus,
}

#[contracttype]
pub enum Providers {
    ProviderIdToProvider(u64),
    AddressToProviderId(Address),
}

impl Provider {
    fn new(address: Address) -> Self {
        Provider {
            address,
            trust_level: TrustLevel::Five,
            status: ProviderStatus::Registered,
        }
    }
}

#[contractimpl]
impl ProviderRegistryContract {
    pub fn set_trust_level(env: Env, from: Address, provider_id: u64, trust_level: TrustLevel) {
        from.require_auth(); // should be an verifier.. add access control

        let mut provider: Provider = env
            .storage()
            .instance()
            .get(&Providers::ProviderIdToProvider(provider_id))
            .unwrap_or_else(|| panic!("Provider with ID {} not found", provider_id));

        // verify reward score

        provider.trust_level = trust_level;

        env.storage()
            .instance()
            .set(&Providers::ProviderIdToProvider(provider_id), &provider);
    }

    pub fn set_provider_status(env: Env, from: Address, provider_id: u64, status: ProviderStatus) {
        from.require_auth(); // should be an verifier.. add access control

        let mut provider: Provider = env
            .storage()
            .instance()
            .get(&Providers::ProviderIdToProvider(provider_id))
            .unwrap_or_else(|| panic!("Provider with ID {} not found", provider_id));

        provider.status = status;

        env.storage()
            .instance()
            .set(&Providers::ProviderIdToProvider(provider_id), &provider);
    }

    pub fn get_provider(env: Env, provider_id: u64) -> Provider {
        env.storage()
            .instance()
            .get(&Providers::ProviderIdToProvider(provider_id))
            .unwrap_or_else(|| panic!("Provider with ID {} not found", provider_id))
    }

    pub fn get_provider_by_address(env: Env, address: Address) -> (u64, Provider) {
        let provider_id: u64 = env
            .storage()
            .instance()
            .get(&Providers::AddressToProviderId(address))
            .unwrap_or_else(|| panic!("Provider with address not found"));

        let provider = env
            .storage()
            .instance()
            .get(&Providers::ProviderIdToProvider(provider_id))
            .unwrap_or_else(|| panic!("Provider with ID {} not found", provider_id));

        (provider_id, provider)
    }

    pub fn list_provider(env: Env) -> Vec<Provider> {
        let mut providers = Vec::new(&env);
        let provider_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProviderCount)
            .unwrap_or(0);

        for i in 1..=provider_count {
            if let Some(provider) = env
                .storage()
                .instance()
                .get(&Providers::ProviderIdToProvider(i))
            {
                providers.push_back(provider);
            }
        }

        providers
    }

    pub fn add_provider(env: Env, address: Address) -> u64 {
        // check existing provider for address
        let existing_provider_id: Option<u64> = env
            .storage()
            .instance()
            .get(&Providers::AddressToProviderId(address.clone()));

        if let Some(provider_id) = existing_provider_id {
            let existing_provider: Provider = env
                .storage()
                .instance()
                .get(&Providers::ProviderIdToProvider(provider_id))
                .unwrap();

            if existing_provider.status != ProviderStatus::Deactivated {
                return provider_id;
            }
        }

        let mut provider_count = env
            .storage()
            .instance()
            .get(&DataKey::ProviderCount)
            .unwrap_or(0);

        provider_count += 1;
        let provider_id = provider_count.clone();
        let provider = Provider::new(address.clone());

        env.storage()
            .instance()
            .set(&Providers::ProviderIdToProvider(provider_id), &provider);

        env.storage()
            .instance()
            .set(&DataKey::ProviderCount, &provider_id);

        env.storage()
            .instance()
            .set(&Providers::AddressToProviderId(address), &provider_id);

        provider_id
    }
}

mod test;
