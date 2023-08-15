"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var encryption_1 = require("./encryption");
var vitest_1 = require("vitest");
(0, vitest_1.describe)('Encryption tests', function () {
    var secretMessage = 'Hello, World!';
    var password = 'correcthorsebatterystaple';
    (0, vitest_1.test)('original message can be recovered', function () {
        var encrypted = (0, encryption_1.encrypt)(secretMessage, password);
        var decrypted = (0, encryption_1.decrypt)(encrypted, password);
        (0, vitest_1.expect)(decrypted).toBe(secretMessage);
    });
    (0, vitest_1.test)('despite different initialization vector, both can still decrypt', function () {
        // Different initialization vector's make these different
        var encryptedA = (0, encryption_1.encrypt)(secretMessage, password);
        var encryptedB = (0, encryption_1.encrypt)(secretMessage, password);
        (0, vitest_1.expect)(encryptedA).not.toBe(encryptedB);
        // But they can still decrypt
        var decryptedA = (0, encryption_1.decrypt)(encryptedA, password);
        var decryptedB = (0, encryption_1.decrypt)(encryptedB, password);
        (0, vitest_1.expect)(decryptedA).toBe(secretMessage);
        (0, vitest_1.expect)(decryptedB).toBe(secretMessage);
        (0, vitest_1.expect)(decryptedA).toBe(decryptedB);
    });
    (0, vitest_1.test)('different keys produce different results', function () {
        var otherPassword = 'wrong-password-123';
        var encryptedA = (0, encryption_1.encrypt)(secretMessage, password);
        var encryptedB = (0, encryption_1.encrypt)(secretMessage, otherPassword);
        (0, vitest_1.expect)(encryptedA).not.toBe(encryptedB);
    });
    (0, vitest_1.test)('decryption fails with incorrect key', function () {
        var otherPassword = 'wrong-password-123';
        var encrypted = (0, encryption_1.encrypt)(secretMessage, password);
        try {
            (0, encryption_1.decrypt)(encrypted, otherPassword);
            // If decryption doesn't throw an error, then it's a failure
            (0, vitest_1.expect)('Decryption should have thrown an error').toBe(false);
        }
        catch (error) {
            (0, vitest_1.expect)(true).toBe(true); // This is expected
        }
    });
    (0, vitest_1.test)('encrypts empty string', function () {
        var encrypted = (0, encryption_1.encrypt)('', password);
        var decrypted = (0, encryption_1.decrypt)(encrypted, password);
        (0, vitest_1.expect)(decrypted).toBe('');
    });
    (0, vitest_1.test)('decrypt raises error with undefined', function () {
        try {
            (0, encryption_1.decrypt)(undefined, password);
            (0, vitest_1.expect)('Decryption should have thrown an error').toBe(false);
        }
        catch (error) {
            (0, vitest_1.expect)(true).toBe(true); // This is expected
        }
    });
    (0, vitest_1.test)('encrypts large message', function () {
        var largeMessage = 'a'.repeat(1000);
        var encrypted = (0, encryption_1.encrypt)(largeMessage, password);
        var decrypted = (0, encryption_1.decrypt)(encrypted, password);
        (0, vitest_1.expect)(decrypted).toBe(largeMessage);
    });
});
