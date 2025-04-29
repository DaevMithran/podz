// #![no_std]
// use soroban_sdk::{
//     contract, contractimpl, contracttype, log, panic_with_error,
//     token::{Client as TokenClient, StellarAssetClient},
//     Address, Env, Vec,
// };

// // Define error codes for the contract
// #[derive(Copy, Clone, Debug)]
// #[repr(u32)]
// pub enum Error {
//     ProviderCantClaimRewards = 1,
//     InvalidAmount = 2,
//     InvalidAddress = 3,
//     ZeroEra = 4,
//     NoReward = 5,
//     ArrayMismatch = 6,
//     NoSlashedEras = 7,
//     NotFound = 8,
//     UnAuthorized = 9,
//     AlreadySlashed = 10,
//     AlreadyPaused = 11,
//     NotPaused = 12,
// }

// // Define data structures
// #[contracttype]
// #[derive(Clone)]
// pub enum DataKey {
//     DeploymentTimestamp,
//     PausedTimestamp,
//     PausedEra,
//     IsEraPaused,
//     RewardToken,
//     ProviderBaseReward(Address), // Base reward rate for provider
//     Provider(Address),           // Provider data
//     IsEraSlashed(Address, u32),  // Is specific era slashed
//     ProviderSlashedAmount(Address),
//     PendingRewards(Address),
//     ProviderSlashedEras(Address),
//     PausedPeriods(Address),
//     IsPausedProvider(Address),
// }

// #[contracttype]
// #[derive(Clone)]
// pub struct Provider {
//     provider: Address,
//     last_claimed_era: u32,
//     denied: bool,
//     slashed_eras: u32,
//     is_paused: bool,
//     paused_era: u32,
//     rewards_before_pause: u128,
// }

// #[contracttype]
// #[derive(Clone)]
// pub struct SlashedEra {
//     era: u32,
//     slashed_amount: u128,
// }

// #[contracttype]
// #[derive(Clone)]
// pub struct PausedPeriod {
//     start_era: u32,
//     end_era: u32,
//     rewards_before_pause: u128,
// }

// #[contract]
// pub struct ProviderRewardsManager;

// #[contractimpl]
// impl ProviderRewardsManager {
//     // Initialize the contract
//     pub fn initialize(e: Env, reward_token: Address) -> Self {
//         // Store contract initialization data
//         e.storage()
//             .instance()
//             .set(&DataKey::DeploymentTimestamp, &e.ledger().timestamp());
//         e.storage().instance().set(&DataKey::IsEraPaused, &false);
//         e.storage()
//             .instance()
//             .set(&DataKey::RewardToken, &reward_token);

//         Self {}
//     }

//     // Set base reward rate for a provider
//     pub fn set_provider_base_reward(e: Env, provider: Address, reward_rate: u128) {
//         e.storage()
//             .instance()
//             .set(&DataKey::ProviderBaseReward(provider), &reward_rate);

//         // Emit event
//         log!(&e, "provider_base_reward_set", provider, reward_rate);
//     }

//     // Claim rewards
//     pub fn claim_rewards(e: Env, provider: Address) {
//         // Calculate current era
//         let current_era = self.get_current_era(&e);

//         // Get provider data
//         let provider_data = self.get_provider(&e, &provider);

//         // Basic validations
//         if e.invoker() != provider {
//             panic_with_error!(e, Error::UnAuthorized);
//         }

//         if provider_data.denied {
//             panic_with_error!(e, Error::ProviderCantClaimRewards);
//         }

//         let mut reward: u128 = 0;
//         let eras_elapsed = current_era
//             .checked_sub(provider_data.last_claimed_era)
//             .unwrap_or(0);

//         if eras_elapsed == 0 {
//             panic_with_error!(e, Error::ZeroEra);
//         }

//         if provider_data.is_paused {
//             // If paused, can only claim accumulated rewards before pause
//             reward = provider_data.rewards_before_pause;
//             reward += self.get_pending_rewards(&e, &provider);
//         } else {
//             // Normal reward calculation
//             reward = self.calculate_rewards(&e, &provider, eras_elapsed);
//             reward += provider_data.rewards_before_pause;
//             reward += self.get_pending_rewards(&e, &provider);
//         }

//         if reward == 0 {
//             panic_with_error!(e, Error::NoReward);
//         }

//         // Update provider data
//         let mut new_provider_data = provider_data.clone();
//         new_provider_data.slashed_eras = 0;
//         if !new_provider_data.is_paused {
//             new_provider_data.last_claimed_era = current_era;
//         }
//         new_provider_data.rewards_before_pause = 0;
//         e.storage()
//             .instance()
//             .set(&DataKey::Provider(provider.clone()), &new_provider_data);

//         // Clear slashed amount and pending rewards
//         e.storage()
//             .instance()
//             .set(&DataKey::ProviderSlashedAmount(provider.clone()), &0u128);
//         e.storage()
//             .instance()
//             .set(&DataKey::PendingRewards(provider.clone()), &0u128);

//         // Mint reward tokens to the provider
//         let token_client = self.get_token_client(&e);
//         token_client.mint(&e, &provider, &(reward as i128));

//         // Emit event
//         log!(&e, "provider_reward_claimed", provider, reward);
//     }

//     // Get provider rewards per era
//     pub fn get_provider_rewards_per_era(e: Env, provider: Address) -> u128 {
//         let provider_data = self.get_provider(&e, &provider);
//         if !provider_data.is_paused {
//             self.get_provider_base_reward(&e, &provider)
//         } else {
//             0
//         }
//     }

//     // Get accumulated rewards for a provider
//     pub fn get_acc_rewards_for_provider(e: Env, provider: Address) -> u128 {
//         let provider_data = self.get_provider(&e, &provider);
//         let mut reward = provider_data.rewards_before_pause;

//         if !provider_data.is_paused {
//             // Calculate eras elapsed
//             let era_elapsed = self.calculate_era_elapsed(&e, &provider);
//             // Calculate accumulated rewards
//             reward += self.calculate_rewards(&e, &provider, era_elapsed);
//         }

//         reward += self.get_pending_rewards(&e, &provider);
//         let slashed_amount = self.get_provider_slashed_amount(&e, &provider);

//         if reward >= slashed_amount {
//             reward -= slashed_amount;
//         } else {
//             reward = 0;
//         }

//         reward
//     }

//     // Set denial status for providers
//     pub fn set_denied(e: Env, providers: Vec<Address>, deny: Vec<bool>) {
//         if providers.len() != deny.len() {
//             panic_with_error!(e, Error::ArrayMismatch);
//         }

//         for i in 0..providers.len() {
//             let mut provider_data = self.get_provider(&e, &providers.get(i).unwrap());
//             provider_data.denied = deny.get(i).unwrap();
//             e.storage().instance().set(
//                 &DataKey::Provider(providers.get(i).unwrap()),
//                 &provider_data,
//             );

//             // Emit event
//             log!(
//                 &e,
//                 "provider_denial_status_updated",
//                 providers.get(i).unwrap(),
//                 deny.get(i).unwrap()
//             );
//         }
//     }

//     // Slash providers for specific eras
//     pub fn set_slash_era_for_providers(
//         e: Env,
//         providers: Vec<Address>,
//         eras: Vec<u32>,
//         slashed_percentages: Vec<u8>,
//     ) {
//         if providers.len() != eras.len() || providers.len() != slashed_percentages.len() {
//             panic_with_error!(e, Error::ArrayMismatch);
//         }

//         for i in 0..providers.len() {
//             self.slash_provider(
//                 &e,
//                 &providers.get(i).unwrap(),
//                 eras.get(i).unwrap(),
//                 slashed_percentages.get(i).unwrap(),
//             );
//         }
//     }

//     // Remove slashing penalties
//     pub fn remove_slash_eras_for_providers(e: Env, providers: Vec<Address>, eras: Vec<u32>) {
//         if providers.len() != eras.len() {
//             panic_with_error!(e, Error::ArrayMismatch);
//         }

//         for i in 0..providers.len() {
//             self.unslash_provider(&e, &providers.get(i).unwrap(), eras.get(i).unwrap());
//         }
//     }

//     // Pause rewards for providers
//     pub fn pause_rewards_for_providers(e: Env, providers: Vec<Address>) {
//         for i in 0..providers.len() {
//             self.pause_provider(&e, &providers.get(i).unwrap());
//         }
//     }

//     // Unpause rewards for providers
//     pub fn unpause_rewards_for_providers(e: Env, providers: Vec<Address>) {
//         for i in 0..providers.len() {
//             self.unpause_provider(&e, &providers.get(i).unwrap());
//         }
//     }

//     // Get provider data
//     pub fn get_provider(e: &Env, provider: &Address) -> Provider {
//         e.storage()
//             .instance()
//             .get(&DataKey::Provider(provider.clone()))
//             .unwrap_or(Provider {
//                 provider: provider.clone(),
//                 last_claimed_era: 0,
//                 denied: false,
//                 slashed_eras: 0,
//                 is_paused: false,
//                 paused_era: 0,
//                 rewards_before_pause: 0,
//             })
//     }

//     // Get provider slashed eras
//     pub fn get_provider_slashed_eras(&self, e: Env, provider: Address) -> Vec<SlashedEra> {
//         e.storage()
//             .instance()
//             .get(&DataKey::ProviderSlashedEras(provider))
//             .unwrap_or(Vec::new(&e))
//     }

//     // Update pending rewards
//     pub fn update_pending_rewards(&self, e: Env, provider: Address) {
//         let is_paused = self.is_paused_provider(&e, &provider);

//         if !is_paused {
//             let current_era = self.get_current_era(&e);
//             let mut provider_data = self.get_provider(&e, &provider);

//             // Initialize if not exists
//             if provider_data.provider != provider {
//                 provider_data = Provider {
//                     provider: provider.clone(),
//                     last_claimed_era: current_era,
//                     denied: false,
//                     slashed_eras: 0,
//                     is_paused: false,
//                     paused_era: 0,
//                     rewards_before_pause: 0,
//                 };
//             }

//             // Calculate eras elapsed
//             let eras_elapsed = current_era
//                 .checked_sub(provider_data.last_claimed_era)
//                 .unwrap_or(0);
//             if eras_elapsed == 0 {
//                 return;
//             }

//             provider_data.last_claimed_era = current_era;
//             e.storage()
//                 .instance()
//                 .set(&DataKey::Provider(provider.clone()), &provider_data);

//             let reward = self.calculate_rewards(&e, &provider, eras_elapsed);
//             let pending = self.get_pending_rewards(&e, &provider);
//             e.storage().instance().set(
//                 &DataKey::PendingRewards(provider.clone()),
//                 &(pending + reward),
//             );

//             // Reset slashed eras
//             provider_data.slashed_eras = 0;
//             e.storage()
//                 .instance()
//                 .set(&DataKey::Provider(provider.clone()), &provider_data);
//             e.storage()
//                 .instance()
//                 .set(&DataKey::ProviderSlashedAmount(provider.clone()), &0u128);

//             // Emit event
//             log!(&e, "provider_pending_rewards_updated", provider, reward);
//         } else {
//             // Emit event for 0 rewards
//             log!(&e, "provider_pending_rewards_updated", provider, 0u128);
//         }
//     }

//     // Add pending rewards directly
//     pub fn add_provider_pending_rewards(
//         &self,
//         e: Env,
//         providers: Vec<Address>,
//         amounts: Vec<u128>,
//     ) {
//         if providers.len() != amounts.len() {
//             panic_with_error!(e, Error::ArrayMismatch);
//         }

//         for i in 0..providers.len() {
//             let provider = providers.get(i).unwrap();
//             let amount = amounts.get(i).unwrap();

//             let mut provider_data = self.get_provider(&e, &provider);

//             // Initialize if not exists
//             if provider_data.provider != provider {
//                 provider_data = Provider {
//                     provider: provider.clone(),
//                     last_claimed_era: self.get_current_era(&e),
//                     denied: false,
//                     slashed_eras: 0,
//                     is_paused: false,
//                     paused_era: 0,
//                     rewards_before_pause: 0,
//                 };
//                 e.storage()
//                     .instance()
//                     .set(&DataKey::Provider(provider.clone()), &provider_data);
//             }

//             let pending = self.get_pending_rewards(&e, &provider);
//             e.storage().instance().set(
//                 &DataKey::PendingRewards(provider.clone()),
//                 &(pending + amount),
//             );

//             // Emit event
//             log!(&e, "provider_pending_rewards_added", provider, amount);
//         }
//     }

//     // Pause era count
//     pub fn pause_era_count(&self, e: Env) {
//         let is_era_paused = e
//             .storage()
//             .instance()
//             .get::<_, bool>(&DataKey::IsEraPaused)
//             .unwrap_or(false);

//         if is_era_paused {
//             panic!("Era already paused");
//         }

//         e.storage()
//             .instance()
//             .set(&DataKey::PausedTimestamp, &e.ledger().timestamp());
//         let paused_era = self.get_current_era(&e);
//         e.storage().instance().set(&DataKey::PausedEra, &paused_era);
//         e.storage().instance().set(&DataKey::IsEraPaused, &true);

//         // Emit event
//         log!(&e, "provider_era_count_paused", paused_era);
//     }

//     // Unpause era count
//     pub fn unpause_era_count(&self, e: Env) {
//         let is_era_paused = e
//             .storage()
//             .instance()
//             .get::<_, bool>(&DataKey::IsEraPaused)
//             .unwrap_or(false);

//         if !is_era_paused {
//             panic!("Era not paused");
//         }

//         let deployment_timestamp = e
//             .storage()
//             .instance()
//             .get::<_, u64>(&DataKey::DeploymentTimestamp)
//             .unwrap();
//         let paused_timestamp = e
//             .storage()
//             .instance()
//             .get::<_, u64>(&DataKey::PausedTimestamp)
//             .unwrap();
//         let new_deployment_timestamp =
//             deployment_timestamp + (e.ledger().timestamp() - paused_timestamp);

//         e.storage()
//             .instance()
//             .set(&DataKey::DeploymentTimestamp, &new_deployment_timestamp);
//         e.storage().instance().set(&DataKey::IsEraPaused, &false);

//         // Emit event
//         log!(&e, "provider_era_count_unpaused", self.get_current_era(&e));
//     }

//     // Get current era
//     pub fn get_current_era(&self, e: &Env) -> u32 {
//         let is_era_paused = e
//             .storage()
//             .instance()
//             .get::<_, bool>(&DataKey::IsEraPaused)
//             .unwrap_or(false);

//         if is_era_paused {
//             return e.storage().instance().get(&DataKey::PausedEra).unwrap_or(0);
//         }

//         let deployment_timestamp = e
//             .storage()
//             .instance()
//             .get::<_, u64>(&DataKey::DeploymentTimestamp)
//             .unwrap_or(e.ledger().timestamp());
//         ((e.ledger().timestamp() - deployment_timestamp) / (24 * 60 * 60)) as u32
//         // Convert to days
//     }

//     // Helper methods
//     fn is_paused_provider(&self, e: &Env, provider: &Address) -> bool {
//         e.storage()
//             .instance()
//             .get(&DataKey::IsPausedProvider(provider.clone()))
//             .unwrap_or(false)
//     }

//     fn get_pending_rewards(&self, e: &Env, provider: &Address) -> u128 {
//         e.storage()
//             .instance()
//             .get(&DataKey::PendingRewards(provider.clone()))
//             .unwrap_or(0)
//     }

//     fn get_provider_slashed_amount(&self, e: &Env, provider: &Address) -> u128 {
//         e.storage()
//             .instance()
//             .get(&DataKey::ProviderSlashedAmount(provider.clone()))
//             .unwrap_or(0)
//     }

//     fn get_provider_base_reward(&self, e: &Env, provider: &Address) -> u128 {
//         e.storage()
//             .instance()
//             .get(&DataKey::ProviderBaseReward(provider.clone()))
//             .unwrap_or(100) // Default base reward
//     }

//     fn calculate_era_elapsed(&self, e: &Env, provider: &Address) -> u32 {
//         let provider_data = self.get_provider(e, provider);
//         let current_era = self.get_current_era(e);

//         current_era
//             .checked_sub(provider_data.last_claimed_era)
//             .unwrap_or(0)
//     }

//     // Simplified reward calculation
//     fn calculate_rewards(&self, e: &Env, provider: &Address, eras_elapsed: u32) -> u128 {
//         if eras_elapsed == 0 {
//             return 0;
//         }

//         let rewards_per_era = self.get_provider_base_reward(e, provider);
//         let total_reward = rewards_per_era * (eras_elapsed as u128);
//         let slashed_amount = self.get_provider_slashed_amount(e, provider);

//         if total_reward > slashed_amount {
//             total_reward - slashed_amount
//         } else {
//             0
//         }
//     }

//     fn slash_provider(&self, e: &Env, provider: &Address, era: u32, slashed_percentage: u8) {
//         // Check if already slashed for this era
//         let is_slashed = e
//             .storage()
//             .instance()
//             .get::<_, bool>(&DataKey::IsEraSlashed(provider.clone(), era))
//             .unwrap_or(false);

//         if is_slashed {
//             panic_with_error!(e, Error::AlreadySlashed);
//         }

//         if slashed_percentage < 1 || slashed_percentage > 100 {
//             panic_with_error!(e, Error::InvalidAmount);
//         }

//         // Update provider data
//         let mut provider_data = self.get_provider(e, provider);
//         provider_data.slashed_eras += 1;
//         e.storage()
//             .instance()
//             .set(&DataKey::Provider(provider.clone()), &provider_data);

//         // Mark era as slashed
//         e.storage()
//             .instance()
//             .set(&DataKey::IsEraSlashed(provider.clone(), era), &true);

//         // Calculate slashed amount
//         let provider_rewards_per_era = self.get_provider_base_reward(e, provider);
//         let slashed = (provider_rewards_per_era * (slashed_percentage as u128)) / 100;

//         // Update slashed amount
//         let current_slashed = self.get_provider_slashed_amount(e, provider);
//         e.storage().instance().set(
//             &DataKey::ProviderSlashedAmount(provider.clone()),
//             &(current_slashed + slashed),
//         );

//         // Add to slashed eras list
//         let mut slashed_eras = e
//             .storage()
//             .instance()
//             .get::<_, Vec<SlashedEra>>(&DataKey::ProviderSlashedEras(provider.clone()))
//             .unwrap_or(Vec::new(e));

//         slashed_eras.push_back(SlashedEra {
//             era,
//             slashed_amount: slashed,
//         });

//         e.storage().instance().set(
//             &DataKey::ProviderSlashedEras(provider.clone()),
//             &slashed_eras,
//         );

//         // Emit event
//         log!(
//             e,
//             "provider_slashed",
//             provider,
//             era,
//             slashed,
//             slashed_percentage
//         );
//     }

//     fn unslash_provider(&self, e: &Env, provider: &Address, era: u32) {
//         let mut provider_data = self.get_provider(e, provider);

//         if provider_data.slashed_eras == 0 {
//             panic_with_error!(e, Error::NoSlashedEras);
//         }

//         // Get slashed eras
//         let mut slashed_eras = e
//             .storage()
//             .instance()
//             .get::<_, Vec<SlashedEra>>(&DataKey::ProviderSlashedEras(provider.clone()))
//             .unwrap_or(Vec::new(e));

//         // Find the slashed era
//         let mut found = false;
//         let mut index_to_remove = 0;
//         let mut slashed_amount = 0;

//         for (i, slashed_era) in slashed_eras.iter().enumerate() {
//             if slashed_era.era == era {
//                 found = true;
//                 index_to_remove = i;
//                 slashed_amount = slashed_era.slashed_amount;
//                 break;
//             }
//         }

//         if !found {
//             panic_with_error!(e, Error::NotFound);
//         }

//         // Update provider data
//         provider_data.slashed_eras -= 1;
//         e.storage()
//             .instance()
//             .set(&DataKey::Provider(provider.clone()), &provider_data);

//         // Update slashed amount
//         let current_slashed = self.get_provider_slashed_amount(e, provider);
//         e.storage().instance().set(
//             &DataKey::ProviderSlashedAmount(provider.clone()),
//             &(current_slashed.checked_sub(slashed_amount).unwrap_or(0)),
//         );

//         // Remove from slashed eras list
//         slashed_eras.remove(index_to_remove);
//         e.storage().instance().set(
//             &DataKey::ProviderSlashedEras(provider.clone()),
//             &slashed_eras,
//         );

//         // Mark era as not slashed
//         e.storage()
//             .instance()
//             .remove(&DataKey::IsEraSlashed(provider.clone(), era));

//         // Emit event
//         log!(e, "provider_unslashed", provider, era, slashed_amount);
//     }

//     fn pause_provider(&self, e: &Env, provider: &Address) {
//         let is_paused = self.is_paused_provider(e, provider);

//         if is_paused {
//             panic_with_error!(e, Error::AlreadyPaused);
//         }

//         let current_era = self.get_current_era(e);
//         let mut provider_data = self.get_provider(e, provider);

//         // Calculate rewards up to this point
//         let eras_elapsed = current_era
//             .checked_sub(provider_data.last_claimed_era)
//             .unwrap_or(0);
//         let accumulated_rewards = self.calculate_rewards(e, provider, eras_elapsed);

//         // Store accumulated rewards and pause information
//         provider_data.rewards_before_pause = accumulated_rewards;
//         provider_data.is_paused = true;
//         provider_data.paused_era = current_era;
//         e.storage()
//             .instance()
//             .set(&DataKey::Provider(provider.clone()), &provider_data);

//         // Add to paused periods history
//         let mut paused_periods = e
//             .storage()
//             .instance()
//             .get::<_, Vec<PausedPeriod>>(&DataKey::PausedPeriods(provider.clone()))
//             .unwrap_or(Vec::new(e));

//         paused_periods.push_back(PausedPeriod {
//             start_era: current_era,
//             end_era: 0,
//             rewards_before_pause: accumulated_rewards,
//         });

//         e.storage()
//             .instance()
//             .set(&DataKey::PausedPeriods(provider.clone()), &paused_periods);
//         e.storage()
//             .instance()
//             .set(&DataKey::IsPausedProvider(provider.clone()), &true);

//         // Emit event
//         log!(
//             e,
//             "provider_paused",
//             provider,
//             current_era,
//             accumulated_rewards
//         );
//     }

//     fn unpause_provider(&self, e: &Env, provider: &Address) {
//         let is_paused = self.is_paused_provider(e, provider);

//         if !is_paused {
//             panic_with_error!(e, Error::NotPaused);
//         }

//         let current_era = self.get_current_era(e);
//         let mut provider_data = self.get_provider(e, provider);

//         // Update the end era in paused periods
//         let mut paused_periods = e
//             .storage()
//             .instance()
//             .get::<_, Vec<PausedPeriod>>(&DataKey::PausedPeriods(provider.clone()))
//             .unwrap_or(Vec::new(e));

//         if !paused_periods.is_empty() {
//             let last_index = paused_periods.len() - 1;
//             let mut last_period = paused_periods.get(last_index).unwrap();
//             last_period.end_era = current_era;
//             paused_periods.set(last_index, last_period);
//             e.storage()
//                 .instance()
//                 .set(&DataKey::PausedPeriods(provider.clone()), &paused_periods);
//         }

//         // Reset pause-related state but keep accumulated rewards
//         provider_data.is_paused = false;
//         provider_data.last_claimed_era = current_era; // Start counting new rewards from current era
//         e.storage()
//             .instance()
//             .set(&DataKey::Provider(provider.clone()), &provider_data);
//         e.storage()
//             .instance()
//             .set(&DataKey::IsPausedProvider(provider.clone()), &false);

//         // Emit event
//         log!(e, "provider_unpaused", provider, current_era);
//     }

//     // Get token client
//     fn get_token_client(&self, e: &Env) -> TokenClient {
//         let token = e
//             .storage()
//             .instance()
//             .get::<_, Address>(&DataKey::RewardToken)
//             .unwrap();
//         TokenClient::new(e, &token)
//     }
// }
