"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.repeatedHash = void 0;
var sha256_1 = __importDefault(require("crypto-js/sha256"));
var aes_1 = __importDefault(require("crypto-js/aes"));
var enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
var STRETCH_ROUNDS = 5000;
// In cryptography, key stretching techniques are used to make brute-force attacks more difficult.
// The idea is to "stretch" the key (or in this case, the password) by applying a computationally intensive
// operation to it multiple times. This makes each attempt to guess the password more time-consuming,
// which in turn makes brute-force attacks less feasible.
var repeatedHash = function (message) {
    var hash = (0, sha256_1.default)(message);
    for (var i = 0; i < STRETCH_ROUNDS; i++) {
        hash = (0, sha256_1.default)(hash.toString());
    }
    return hash.toString();
};
exports.repeatedHash = repeatedHash;
var encrypt = function (message, key) {
    return aes_1.default.encrypt(message, key).toString();
};
exports.encrypt = encrypt;
var decrypt = function (ciphertext, key) {
    var decrypted = aes_1.default.decrypt(ciphertext, key);
    return decrypted.toString(enc_utf8_1.default);
};
exports.decrypt = decrypt;
