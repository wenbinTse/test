"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const crypto = require('crypto');
/**
 * Generates hash and salt
 * @param {string} password password
 * @returns {Password} hash and salt
 */
function createHashAndSalt(password) {
    const salt = crypto.randomBytes(64).toString('base64');
    const hash = crypto.pbkdf2Sync(password, salt, config_1.default.hashIterationNum, config_1.default.keyLength, 'sha512')
        .toString('hex');
    return { hash, salt };
}
exports.createHashAndSalt = createHashAndSalt;
/**
 * Verifies that the password is correct.
 * @param password The password which user inputs.
 * @param salt The salt in datebase.
 * @param hash The hash in datebase.
 * @returns {boolean} True if password is correct, false otherwise.
 */
function verifyPassword(password, salt, hash) {
    const correctHash = crypto.pbkdf2Sync(password, salt, config_1.default.hashIterationNum, config_1.default.keyLength, 'sha512')
        .toString('hex');
    return hash === correctHash;
}
exports.verifyPassword = verifyPassword;
//# sourceMappingURL=password.js.map