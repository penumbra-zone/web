/* tslint:disable */
/* eslint-disable */
/**
* compute position id
* Arguments:
*     position: `Position`
* Returns: `PositionId`
* @param {any} position
* @returns {any}
*/
export function compute_position_id(position: any): any;
/**
* Loads the proving key as a collection of bytes, and to sets the keys in memory
* dynamicaly at runtime. Failure to bundle the proving keys in the wasm binary
* or call the load function will fail to generate a proof. Consumers of this
* function will additionally require downloading the proving key parameter `.bin`
* file for each key type.
* @param {any} parameters
* @param {string} key_type
*/
export function load_proving_key(parameters: any, key_type: string): void;
/**
* generate a spend key from a seed phrase
* Arguments:
*     seed_phrase: `string`
* Returns: `bech32 string`
* @param {string} seed_phrase
* @returns {any}
*/
export function generate_spend_key(seed_phrase: string): any;
/**
* get full viewing key from spend key
* Arguments:
*     spend_key_str: `bech32 string`
* Returns: `bech32 string`
* @param {string} spend_key
* @returns {any}
*/
export function get_full_viewing_key(spend_key: string): any;
/**
* Wallet id: the hash of a full viewing key, used as an account identifier
* Arguments:
*     full_viewing_key: `bech32 string`
* Returns: `bech32 string`
* @param {string} full_viewing_key
* @returns {string}
*/
export function get_wallet_id(full_viewing_key: string): string;
/**
* get address by index using FVK
* Arguments:
*     full_viewing_key: `bech32 string`
*     index: `u32`
* Returns: `pb::Address`
* @param {string} full_viewing_key
* @param {number} index
* @returns {any}
*/
export function get_address_by_index(full_viewing_key: string, index: number): any;
/**
* get ephemeral (randomizer) address using FVK
* The derivation tree is like "spend key / address index / ephemeral address" so we must also pass index as an argument
* Arguments:
*     full_viewing_key: `bech32 string`
*     index: `u32`
* Returns: `pb::Address`
* @param {string} full_viewing_key
* @param {number} index
* @returns {any}
*/
export function get_ephemeral_address(full_viewing_key: string, index: number): any;
/**
* Check if the address is FVK controlled
* Arguments:
*     full_viewing_key: `bech32 String`
*     address: `bech32 String`
* Returns: `Option<pb::AddressIndex>`
* @param {string} full_viewing_key
* @param {string} address
* @returns {any}
*/
export function is_controlled_address(full_viewing_key: string, address: string): any;
/**
* Get canonical short form address by index
* This feature is probably redundant and will be removed from wasm in the future
* Arguments:
*     full_viewing_key: `bech32 string`
*     index: `u32`
* Returns: `String`
* @param {string} full_viewing_key
* @param {number} index
* @returns {any}
*/
export function get_short_address_by_index(full_viewing_key: string, index: number): any;
/**
* decode SCT root
* Arguments:
*     tx_bytes: `HEX string`
* Returns: `penumbra_tct::Root`
* @param {string} tx_bytes
* @returns {any}
*/
export function decode_sct_root(tx_bytes: string): any;
/**
* Builds a planned [`Action`] specified by
* the [`ActionPlan`] in a [`TransactionPlan`].
* Arguments:
*     transaction_plan: `TransactionPlan`
*     action_plan: `ActionPlan`
*     full_viewing_key: `bech32m String`,
*     witness_data: `WitnessData``
* Returns: `Action`
* @param {any} transaction_plan
* @param {any} action_plan
* @param {string} full_viewing_key
* @param {any} witness_data
* @returns {any}
*/
export function build_action(transaction_plan: any, action_plan: any, full_viewing_key: string, witness_data: any): any;
/**
* encode transaction to bytes
* Arguments:
*     transaction: `penumbra_transaction::Transaction`
* Returns: `<Vec<u8>`
* @param {any} transaction
* @returns {any}
*/
export function encode_tx(transaction: any): any;
/**
* decode base64 bytes to transaction
* Arguments:
*     tx_bytes: `base64 String`
* Returns: `penumbra_transaction::Transaction`
* @param {string} tx_bytes
* @returns {any}
*/
export function decode_tx(tx_bytes: string): any;
/**
* authorize transaction (sign  transaction using  spend key)
* Arguments:
*     spend_key_str: `bech32m String`
*     transaction_plan: `pb::TransactionPlan`
* Returns: `pb::AuthorizationData`
* @param {string} spend_key_str
* @param {any} transaction_plan
* @returns {any}
*/
export function authorize(spend_key_str: string, transaction_plan: any): any;
/**
* Get witness data
* Obtaining witness data is directly related to SCT so we need to pass the tree data
* Arguments:
*     transaction_plan: `pb::TransactionPlan`
*     stored_tree: `StoredTree`
* Returns: `pb::WitnessData`
* @param {any} transaction_plan
* @param {any} stored_tree
* @returns {any}
*/
export function witness(transaction_plan: any, stored_tree: any): any;
/**
* Build serial tx
* Building a transaction may take some time,
* depending on CPU performance and number of actions in transaction_plan
* Arguments:
*     full_viewing_key: `bech32m String`
*     transaction_plan: `pb::TransactionPlan`
*     witness_data: `pb::WitnessData`
*     auth_data: `pb::AuthorizationData`
* Returns: `pb::Transaction`
* @param {string} full_viewing_key
* @param {any} transaction_plan
* @param {any} witness_data
* @param {any} auth_data
* @returns {any}
*/
export function build(full_viewing_key: string, transaction_plan: any, witness_data: any, auth_data: any): any;
/**
* Build parallel tx
* Building a transaction may take some time,
* depending on CPU performance and number of actions in transaction_plan
* Arguments:
*     actions: `Vec<Actions>`
*     transaction_plan: `pb::TransactionPlan`
*     witness_data: `pb::WitnessData`
*     auth_data: `pb::AuthorizationData`
* Returns: `pb::Transaction`
* @param {any} actions
* @param {any} transaction_plan
* @param {any} witness_data
* @param {any} auth_data
* @returns {any}
*/
export function build_parallel(actions: any, transaction_plan: any, witness_data: any, auth_data: any): any;
/**
* Get transaction view, transaction perspective
* Arguments:
*     full_viewing_key: `bech32 String`
*     tx: `pbt::Transaction`
*     idb_constants: IndexedDbConstants
* Returns: `TxInfoResponse`
* @param {string} full_viewing_key
* @param {any} tx
* @param {any} idb_constants
* @returns {Promise<any>}
*/
export function transaction_info(full_viewing_key: string, tx: any, idb_constants: any): Promise<any>;
/**
*/
export class ViewServer {
  free(): void;
/**
* Create new instances of `ViewServer`
* Function opens a connection to indexedDb
* Arguments:
*     full_viewing_key: `bech32 string`
*     epoch_duration: `u64`
*     stored_tree: `StoredTree`
*     idb_constants: `IndexedDbConstants`
* Returns: `ViewServer`
* @param {string} full_viewing_key
* @param {bigint} epoch_duration
* @param {any} stored_tree
* @param {any} idb_constants
* @returns {Promise<ViewServer>}
*/
  static new(full_viewing_key: string, epoch_duration: bigint, stored_tree: any, idb_constants: any): Promise<ViewServer>;
/**
* Scans block for notes, swaps
* Returns true if the block contains new notes, swaps or false if the block is empty for us
*     compact_block: `v1::CompactBlock`
* Scan results are saved in-memory rather than returned
* Use `flush_updates()` to get the scan results
* Returns: `bool`
* @param {any} compact_block
* @returns {Promise<boolean>}
*/
  scan_block(compact_block: any): Promise<boolean>;
/**
* Get new notes, swaps, SCT state updates
* Function also clears state
* Returns: `ScanBlockResult`
* @returns {any}
*/
  flush_updates(): any;
/**
* get SCT root
* SCT root can be compared with the root obtained by GRPC and verify that there is no divergence
* Returns: `Root`
* @returns {any}
*/
  get_sct_root(): any;
/**
* get LP NFT asset
* Arguments:
*     position_value: `lp::position::Position`
*     position_state_value: `lp::position::State`
* Returns: `DenomMetadata`
* @param {any} position_value
* @param {any} position_state_value
* @returns {any}
*/
  get_lpnft_asset(position_value: any, position_state_value: any): any;
}
/**
*/
export class WasmPlanner {
  free(): void;
/**
* Create new instances of `WasmPlanner`
* Function opens a connection to indexedDb
* Arguments:
*     idb_constants: `IndexedDbConstants`
*     chain_id: `String`
*     sct_parameters: `SctParameters`
*     fmd_params: `penumbra_shielded_pool::fmd::Parameters`
* Returns: `WasmPlanner`
* @param {any} idb_constants
* @param {any} chain_id
* @param {any} sct_params
* @param {any} fmd_params
* @returns {Promise<WasmPlanner>}
*/
  static new(idb_constants: any, chain_id: any, sct_params: any, fmd_params: any): Promise<WasmPlanner>;
/**
* Public getter for the 'storage' field
* @returns {number}
*/
  get_storage(): number;
/**
* Add expiry height to plan
* Arguments:
*     expiry_height: `u64`
* @param {bigint} expiry_height
*/
  expiry_height(expiry_height: bigint): void;
/**
* Set gas prices
* Arguments:
*     gas_prices: `GasPrices`
* @param {any} gas_prices
*/
  set_gas_prices(gas_prices: any): void;
/**
* Set fee tier
* Arguments:
*     fee_tier: `FeeTier`
* @param {any} fee_tier
*/
  set_fee_tier(fee_tier: any): void;
/**
* Add memo to plan
* Arguments:
*     memo: `MemoPlaintext`
* @param {any} memo
*/
  memo(memo: any): void;
/**
* Add fee to plan
* Arguments:
*     fee: `Fee`
* @param {any} fee
*/
  fee(fee: any): void;
/**
* Add output to plan
* Arguments:
*     value: `Value`
*     address: `Address`
* @param {any} value
* @param {any} address
*/
  output(value: any, address: any): void;
/**
* Add swap claim to plan
* Arguments:
*     swap_commitment: `StateCommitment`
* @param {any} swap_commitment
* @returns {Promise<void>}
*/
  swap_claim(swap_commitment: any): Promise<void>;
/**
* Add swap  to plan
* Arguments:
*     input_value: `Value`
*     into_denom: `DenomMetadata`
*     swap_claim_fee: `Fee`
*     claim_address: `Address`
* @param {any} input_value
* @param {any} into_denom
* @param {any} swap_claim_fee
* @param {any} claim_address
*/
  swap(input_value: any, into_denom: any, swap_claim_fee: any, claim_address: any): void;
/**
* Add ICS20 withdrawal to plan
* Arguments:
*     withdrawal: `Ics20Withdrawal`
* @param {any} withdrawal
*/
  ics20_withdrawal(withdrawal: any): void;
/**
* Builds transaction plan.
* Refund address provided in the case there is extra balances to be returned
* Arguments:
*     refund_address: `Address`
*     source: `Option<AddressIndex>`
* Returns: `TransactionPlan`
* @param {any} refund_address
* @param {any} source
* @returns {Promise<any>}
*/
  plan(refund_address: any, source: any): Promise<any>;
}
