#![no_std]
use core::panic;

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

use provider_registry;

#[contract]
pub struct EscrowContract;

#[contracttype]
pub struct Tenant {
    locked_balance: i128,
    unlocked_balance: i128,
}

#[contracttype]
pub struct ProviderToken {
    earned: i128,
    withdrawn: i128,
    balance: i128,
}

// strorage

#[contracttype]
pub enum DataKey {
    TenantBalance(Address, Address),
    ProviderEarnings(u64, Address),
    ProviderRegistry,
}

#[contractimpl]
impl EscrowContract {
    pub fn __constructor(env: Env, provider_registry: Address) {
        env.storage()
            .instance()
            .set(&DataKey::ProviderRegistry, &provider_registry);
    }

    pub fn deposit(env: Env, token_address: Address, from: Address, amount: i128) {
        // Require authorization from the sender
        from.require_auth();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        let mut curr_balance: Tenant = env
            .storage()
            .instance()
            .get(&DataKey::TenantBalance(from.clone(), token_address.clone()))
            .unwrap_or(Tenant {
                locked_balance: 0,
                unlocked_balance: 0,
            });

        curr_balance.unlocked_balance += amount;
        env.storage()
            .instance()
            .set(&DataKey::TenantBalance(from, token_address), &curr_balance);
    }

    pub fn withdraw(env: Env, token_address: Address, to: Address, amount: i128) {
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &to, &amount);

        let mut curr_balance: Tenant = env
            .storage()
            .instance()
            .get(&DataKey::TenantBalance(to.clone(), token_address.clone()))
            .unwrap();

        if curr_balance.unlocked_balance < amount {
            panic!("Insufficient balance");
        }
        curr_balance.unlocked_balance -= amount;
        env.storage()
            .instance()
            .set(&DataKey::TenantBalance(to, token_address), &curr_balance);
    }

    pub fn lock(env: Env, token_address: Address, from: Address, amount: i128) {
        // Require authorization from the sender
        from.require_auth();

        let mut curr_balance: Tenant = env
            .storage()
            .instance()
            .get(&DataKey::TenantBalance(from.clone(), token_address.clone()))
            .unwrap();

        if curr_balance.unlocked_balance < amount {
            panic!("Insufficient balance");
        }

        curr_balance.locked_balance += amount;
        curr_balance.unlocked_balance -= amount;

        env.storage()
            .instance()
            .set(&DataKey::TenantBalance(from, token_address), &curr_balance);
    }

    pub fn unlock_tokens(env: Env, token_address: Address, from: Address, amount: i128) {
        let mut curr_balance: Tenant = env
            .storage()
            .instance()
            .get(&DataKey::TenantBalance(from.clone(), token_address.clone()))
            .unwrap();

        if curr_balance.locked_balance < amount {
            panic!("Insufficient balance");
        }

        curr_balance.locked_balance -= amount;
        curr_balance.unlocked_balance += amount;

        env.storage()
            .instance()
            .set(&DataKey::TenantBalance(from, token_address), &curr_balance);
    }

    pub fn transfer_locked(
        env: Env,
        token_address: Address,
        from: Address,
        amount: i128,
        provider: u64,
    ) {
        let curr_balance: Tenant = env
            .storage()
            .instance()
            .get(&DataKey::TenantBalance(from.clone(), token_address.clone()))
            .unwrap();

        if curr_balance.locked_balance < amount {
            panic!("Insufficient balance");
        }

        env.storage().instance().update(
            &DataKey::TenantBalance(from, token_address.clone()),
            |opt_balance: Option<Tenant>| {
                let mut balance = opt_balance.unwrap_or(Tenant {
                    locked_balance: 0,
                    unlocked_balance: 0,
                });
                balance.locked_balance -= amount;
                balance
            },
        );

        env.storage().instance().update(
            &DataKey::ProviderEarnings(provider, token_address),
            |opt_balance: Option<ProviderToken>| {
                let mut balance = opt_balance.unwrap_or(ProviderToken {
                    earned: 0,
                    withdrawn: 0,
                    balance: 0,
                });
                balance.earned += amount;
                balance.balance += amount;
                balance
            },
        );
    }

    pub fn withdraw_provider_earnings(env: Env, from: Address, token_address: Address) {
        from.require_auth();

        // get provider registry
        let provider_registry = env
            .storage()
            .instance()
            .get(&DataKey::ProviderRegistry)
            .unwrap_or_else(|| panic!("Provider registry contract is not found"));

        // get provider
        let provider_registry_client =
            provider_registry::ProviderRegistryContractClient::new(&env, &provider_registry);
        let (provider_id, _) = provider_registry_client.get_provider_by_address(&from);

        let mut provider_earnings: ProviderToken = env
            .storage()
            .temporary()
            .get(&DataKey::ProviderEarnings(
                provider_id,
                token_address.clone(),
            ))
            .unwrap_or_else(|| panic!("Provider {} has no earnings in token", provider_id));

        let token_client = token::Client::new(&env, &token_address);

        token_client.transfer(
            &env.current_contract_address(),
            &from,
            &provider_earnings.balance,
        );

        provider_earnings.withdrawn += provider_earnings.balance;
        provider_earnings.balance = 0;

        env.storage().instance().set(
            &DataKey::ProviderEarnings(provider_id, token_address),
            &provider_earnings,
        );
    }

    pub fn update_provider_registry(env: Env, provider_registry: Address) {
        env.storage()
            .instance()
            .set(&DataKey::ProviderRegistry, &provider_registry);
    }

    pub fn get_tenant_balance(env: Env, token_address: Address, from: Address) -> Tenant {
        env.storage()
            .instance()
            .get(&DataKey::TenantBalance(from, token_address))
            .unwrap_or_else(|| panic!("Tenant balance not found"))
    }

    pub fn get_provider_earnings(
        env: Env,
        provider_id: u64,
        token_address: Address,
    ) -> ProviderToken {
        env.storage()
            .instance()
            .get(&DataKey::ProviderEarnings(provider_id, token_address))
            .unwrap_or_else(|| panic!("Provider {} has no earnings in token", provider_id))
    }

    pub fn get_provider_registry(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::ProviderRegistry)
            .unwrap_or_else(|| panic!("Provider registry contract is not found"))
    }
}

mod test;
