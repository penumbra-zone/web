let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
});

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;
                CLOSURE_DTORS.unregister(state);
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_48(arg0, arg1) {
    wasm._dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h40aec160589ff3c1(arg0, arg1);
}

function __wbg_adapter_51(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1__h6b9eb8fb02c0364c(arg0, arg1, addHeapObject(arg2));
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_54(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h2cd416914c9476c4(arg0, arg1, addHeapObject(arg2));
}

/**
* Loads the proving key as a collection of bytes, and to sets the keys in memory
* dynamicaly at runtime. Failure to bundle the proving keys in the wasm binary
* or call the load function will fail to generate a proof. Consumers of this
* function will additionally require downloading the proving key parameter `.bin`
* file for each key type.
* @param {any} parameters
* @param {string} key_type
*/
export function load_proving_key(parameters, key_type) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(key_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.load_proving_key(retptr, addHeapObject(parameters), ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* generate a spend key from a seed phrase
* Arguments:
*     seed_phrase: `string`
* Returns: `bech32 string`
* @param {string} seed_phrase
* @returns {any}
*/
export function generate_spend_key(seed_phrase) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(seed_phrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.generate_spend_key(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* get full viewing key from spend key
* Arguments:
*     spend_key_str: `bech32 string`
* Returns: `bech32 string`
* @param {string} spend_key
* @returns {any}
*/
export function get_full_viewing_key(spend_key) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(spend_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.get_full_viewing_key(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* Wallet id: the hash of a full viewing key, used as an account identifier
* Arguments:
*     full_viewing_key: `bech32 string`
* Returns: `bech32 string`
* @param {string} full_viewing_key
* @returns {string}
*/
export function get_wallet_id(full_viewing_key) {
    let deferred3_0;
    let deferred3_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.get_wallet_id(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        var r3 = getInt32Memory0()[retptr / 4 + 3];
        var ptr2 = r0;
        var len2 = r1;
        if (r3) {
            ptr2 = 0; len2 = 0;
            throw takeObject(r2);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

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
export function get_address_by_index(full_viewing_key, index) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.get_address_by_index(retptr, ptr0, len0, index);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function get_ephemeral_address(full_viewing_key, index) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.get_ephemeral_address(retptr, ptr0, len0, index);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function is_controlled_address(full_viewing_key, address) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.is_controlled_address(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function get_short_address_by_index(full_viewing_key, index) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.get_short_address_by_index(retptr, ptr0, len0, index);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* compute position id
* Arguments:
*     position: `Position`
* Returns: `PositionId`
* @param {any} position
* @returns {any}
*/
export function compute_position_id(position) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.compute_position_id(retptr, addHeapObject(position));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function build_action(transaction_plan, action_plan, full_viewing_key, witness_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.build_action(retptr, addHeapObject(transaction_plan), addHeapObject(action_plan), ptr0, len0, addHeapObject(witness_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* encode transaction to bytes
* Arguments:
*     transaction: `penumbra_transaction::Transaction`
* Returns: `<Vec<u8>`
* @param {any} transaction
* @returns {any}
*/
export function encode_tx(transaction) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.encode_tx(retptr, addHeapObject(transaction));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* decode base64 bytes to transaction
* Arguments:
*     tx_bytes: `base64 String`
* Returns: `penumbra_transaction::Transaction`
* @param {string} tx_bytes
* @returns {any}
*/
export function decode_tx(tx_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(tx_bytes, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decode_tx(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function authorize(spend_key_str, transaction_plan) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(spend_key_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.authorize(retptr, ptr0, len0, addHeapObject(transaction_plan));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function witness(transaction_plan, stored_tree) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.witness(retptr, addHeapObject(transaction_plan), addHeapObject(stored_tree));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function build(full_viewing_key, transaction_plan, witness_data, auth_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.build(retptr, ptr0, len0, addHeapObject(transaction_plan), addHeapObject(witness_data), addHeapObject(auth_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function build_parallel(actions, transaction_plan, witness_data, auth_data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.build_parallel(retptr, addHeapObject(actions), addHeapObject(transaction_plan), addHeapObject(witness_data), addHeapObject(auth_data));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
export function transaction_info(full_viewing_key, tx, idb_constants) {
    const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.transaction_info(ptr0, len0, addHeapObject(tx), addHeapObject(idb_constants));
    return takeObject(ret);
}

/**
* decode SCT root
* Arguments:
*     tx_bytes: `HEX string`
* Returns: `penumbra_tct::Root`
* @param {string} tx_bytes
* @returns {any}
*/
export function decode_sct_root(tx_bytes) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(tx_bytes, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.decode_sct_root(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_216(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h65b472bbee1264a6(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const ViewServerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_viewserver_free(ptr >>> 0));
/**
*/
export class ViewServer {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ViewServer.prototype);
        obj.__wbg_ptr = ptr;
        ViewServerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ViewServerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_viewserver_free(ptr);
    }
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
    static new(full_viewing_key, epoch_duration, stored_tree, idb_constants) {
        const ptr0 = passStringToWasm0(full_viewing_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.viewserver_new(ptr0, len0, epoch_duration, addHeapObject(stored_tree), addHeapObject(idb_constants));
        return takeObject(ret);
    }
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
    scan_block(compact_block) {
        const ret = wasm.viewserver_scan_block(this.__wbg_ptr, addHeapObject(compact_block));
        return takeObject(ret);
    }
    /**
    * Get new notes, swaps, SCT state updates
    * Function also clears state
    * Returns: `ScanBlockResult`
    * @returns {any}
    */
    flush_updates() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.viewserver_flush_updates(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * get SCT root
    * SCT root can be compared with the root obtained by GRPC and verify that there is no divergence
    * Returns: `Root`
    * @returns {any}
    */
    get_sct_root() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.viewserver_get_sct_root(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    get_lpnft_asset(position_value, position_state_value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.viewserver_get_lpnft_asset(retptr, this.__wbg_ptr, addHeapObject(position_value), addHeapObject(position_state_value));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WasmPlannerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmplanner_free(ptr >>> 0));
/**
*/
export class WasmPlanner {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmPlanner.prototype);
        obj.__wbg_ptr = ptr;
        WasmPlannerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmPlannerFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmplanner_free(ptr);
    }
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
    static new(idb_constants, chain_id, sct_params, fmd_params) {
        const ret = wasm.wasmplanner_new(addHeapObject(idb_constants), addHeapObject(chain_id), addHeapObject(sct_params), addHeapObject(fmd_params));
        return takeObject(ret);
    }
    /**
    * Public getter for the 'storage' field
    * @returns {number}
    */
    get_storage() {
        const ret = wasm.wasmplanner_get_storage(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * Add expiry height to plan
    * Arguments:
    *     expiry_height: `u64`
    * @param {bigint} expiry_height
    */
    expiry_height(expiry_height) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_expiry_height(retptr, this.__wbg_ptr, expiry_height);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set gas prices
    * Arguments:
    *     gas_prices: `GasPrices`
    * @param {any} gas_prices
    */
    set_gas_prices(gas_prices) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_set_gas_prices(retptr, this.__wbg_ptr, addHeapObject(gas_prices));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set fee tier
    * Arguments:
    *     fee_tier: `FeeTier`
    * @param {any} fee_tier
    */
    set_fee_tier(fee_tier) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_set_fee_tier(retptr, this.__wbg_ptr, addHeapObject(fee_tier));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add memo to plan
    * Arguments:
    *     memo: `MemoPlaintext`
    * @param {any} memo
    */
    memo(memo) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_memo(retptr, this.__wbg_ptr, addHeapObject(memo));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add fee to plan
    * Arguments:
    *     fee: `Fee`
    * @param {any} fee
    */
    fee(fee) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_fee(retptr, this.__wbg_ptr, addHeapObject(fee));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add output to plan
    * Arguments:
    *     value: `Value`
    *     address: `Address`
    * @param {any} value
    * @param {any} address
    */
    output(value, address) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_output(retptr, this.__wbg_ptr, addHeapObject(value), addHeapObject(address));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add swap claim to plan
    * Arguments:
    *     swap_commitment: `StateCommitment`
    * @param {any} swap_commitment
    * @returns {Promise<void>}
    */
    swap_claim(swap_commitment) {
        const ret = wasm.wasmplanner_swap_claim(this.__wbg_ptr, addHeapObject(swap_commitment));
        return takeObject(ret);
    }
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
    swap(input_value, into_denom, swap_claim_fee, claim_address) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_swap(retptr, this.__wbg_ptr, addHeapObject(input_value), addHeapObject(into_denom), addHeapObject(swap_claim_fee), addHeapObject(claim_address));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Add ICS20 withdrawal to plan
    * Arguments:
    *     withdrawal: `Ics20Withdrawal`
    * @param {any} withdrawal
    */
    ics20_withdrawal(withdrawal) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasmplanner_ics20_withdrawal(retptr, this.__wbg_ptr, addHeapObject(withdrawal));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
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
    plan(refund_address, source) {
        const ret = wasm.wasmplanner_plan(this.__wbg_ptr, addHeapObject(refund_address), addHeapObject(source));
        return takeObject(ret);
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_in(arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    return ret;
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_is_bigint(arg0) {
    const ret = typeof(getObject(arg0)) === 'bigint';
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_jsval_eq(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_viewserver_new(arg0) {
    const ret = ViewServer.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_wasmplanner_new(arg0) {
    const ret = WasmPlanner.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_Window_2323448e22bf340f(arg0) {
    const ret = getObject(arg0).Window;
    return addHeapObject(ret);
};

export function __wbg_WorkerGlobalScope_4f52a4f4757baa51(arg0) {
    const ret = getObject(arg0).WorkerGlobalScope;
    return addHeapObject(ret);
};

export function __wbg_global_bb13ba737d1fd37d(arg0) {
    const ret = getObject(arg0).global;
    return addHeapObject(ret);
};

export function __wbg_indexedDB_553c6eee256a5956() { return handleError(function (arg0) {
    const ret = getObject(arg0).indexedDB;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_queueMicrotask_f82fc5d1e8f816ae(arg0) {
    const ret = getObject(arg0).queueMicrotask;
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg_queueMicrotask_f61ee94ee663068b(arg0) {
    queueMicrotask(getObject(arg0));
};

export function __wbg_indexedDB_77a16dc2a61961a9() { return handleError(function (arg0) {
    const ret = getObject(arg0).indexedDB;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_indexedDB_e4614e570b5f5c8f() { return handleError(function (arg0) {
    const ret = getObject(arg0).indexedDB;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_open_e75f6c89e35c2edf() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0);
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_a511742412eef1ff() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).get(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_getAll_1caa822d699d7f00() { return handleError(function (arg0) {
    const ret = getObject(arg0).getAll();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_index_494185b56c74838e() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).index(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_put_f5ab898915aa0ec4() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).put(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_target_6795373f170fd786(arg0) {
    const ret = getObject(arg0).target;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};

export function __wbg_setonblocked_3b51cb452de6f3bb(arg0, arg1) {
    getObject(arg0).onblocked = getObject(arg1);
};

export function __wbg_setonupgradeneeded_704b0c0061756fd9(arg0, arg1) {
    getObject(arg0).onupgradeneeded = getObject(arg1);
};

export function __wbg_result_43ea35e72f0fa7c7() { return handleError(function (arg0) {
    const ret = getObject(arg0).result;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_error_180ee1f6d813554e() { return handleError(function (arg0) {
    const ret = getObject(arg0).error;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };

export function __wbg_readyState_c01805a61691813e(arg0) {
    const ret = getObject(arg0).readyState;
    return addHeapObject(ret);
};

export function __wbg_setonsuccess_07be5f02db609d40(arg0, arg1) {
    getObject(arg0).onsuccess = getObject(arg1);
};

export function __wbg_setonerror_4042c0d324fafcf9(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
};

export function __wbg_setonabort_2580e07fbf4b5b38(arg0, arg1) {
    getObject(arg0).onabort = getObject(arg1);
};

export function __wbg_setoncomplete_d9643b9200c8bfcb(arg0, arg1) {
    getObject(arg0).oncomplete = getObject(arg1);
};

export function __wbg_setonerror_493ac3af685d641e(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
};

export function __wbg_objectStore_402a3923882f9f3f() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_setonversionchange_205ab84a7e6decc6(arg0, arg1) {
    getObject(arg0).onversionchange = getObject(arg1);
};

export function __wbg_transaction_5c45557b6d17b46f() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).transaction(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_transaction_f5db8426170b02d3() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = getObject(arg0).transaction(getStringFromWasm0(arg1, arg2), takeObject(arg3));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_037ff0e861f69036() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).get(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

export function __wbg_String_88810dfeb4021902(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_getwithrefkey_5e6d9547403deab8(arg0, arg1) {
    const ret = getObject(arg0)[getObject(arg1)];
    return addHeapObject(ret);
};

export function __wbg_set_841ac57cff3d672b(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_crypto_d05b68a3572bb8ca(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_process_b02b3570280d0366(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_c1cb42213cedf0f5(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_43b1089f407e4ec2(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbg_require_9a7e0f667ead4995() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_msCrypto_10fc94afee92bd76(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_b70ccbdf4926a99d() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_getRandomValues_7e42b4fb8779dc6d() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_get_0ee8ea3c7c984c45(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_length_161c0d89c6535c1d(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_new_75208e29bddfd88c() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_newnoargs_cfecb3965268594c(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_next_586204376d2ed373(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_next_b2d3366343a208b3() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_90b14d6f6eacc42f(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_value_3158be908c80a75e(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_iterator_40027cdd598da26b() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_get_3fddfed2c83f434c() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_call_3f093dd26d5569f8() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_632630b5cec17f21() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbg_self_05040bd9523805b9() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_adc720039f2cb14f() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_622105db80c1457d() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_f56b013ed9bcf359() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_set_79c308ecd9a1d091(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_from_58c79ccfb68060f5(arg0) {
    const ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_isArray_e783c41d0dd19b44(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_9221fa854ffb71b5(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_call_67f2111acd2dfdb6() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_isSafeInteger_a23a66ee7c41b273(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

export function __wbg_entries_488960b196cfb6a5(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_new_70828a4353259d4b(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_216(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_resolve_5da6faf2c96fd1d5(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_then_f9e58f5a50f43eae(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_buffer_b914fb8b50ebbc3e(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_0de9ee56e9f6ee6e(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_b1f2d6842d615181(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_7d988c98e6ced92d(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_21c4b0ae73cba59d(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbg_instanceof_Uint8Array_c299a4ee232e76ba(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_newwithlength_0d03cef43b68a530(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_subarray_adc418253d76e2f1(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2591(arg0, arg1, arg2) {
    const ret = makeClosure(arg0, arg1, 295, __wbg_adapter_48);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2593(arg0, arg1, arg2) {
    const ret = makeClosure(arg0, arg1, 295, __wbg_adapter_51);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper2616(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 323, __wbg_adapter_54);
    return addHeapObject(ret);
};

