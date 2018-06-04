"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const util_1 = require("util");
const __1 = require("..");
const error_1 = require("../error/error");
const enums_1 = require("../proto/enums");
exports.NULL_BUFFER = new Buffer('\0', 'binary');
const PROTOCOL_VERSION = 0;
const AUTHENTIFICATION_METHOD = 'SCRAM-SHA-256';
const KEY_LENGTH = 32; // Because we are currently using SHA 256
const CACHE_PBKDF2 = {};
var HandshakeState;
(function (HandshakeState) {
    HandshakeState[HandshakeState["INITIAL"] = 0] = "INITIAL";
    HandshakeState[HandshakeState["VERSION_OK"] = 1] = "VERSION_OK";
    HandshakeState[HandshakeState["AUTH"] = 2] = "AUTH";
})(HandshakeState || (HandshakeState = {}));
function buildAuthBuffer(user) {
    const versionBuffer = new Buffer(4);
    versionBuffer.writeInt32LE(enums_1.Version.V1_0, 0);
    const randomString = crypto_1.randomBytes(18).toString('base64');
    const mainBuffer = Buffer.from(JSON.stringify({
        protocol_version: PROTOCOL_VERSION,
        authentication_method: AUTHENTIFICATION_METHOD,
        authentication: `n,,n=${user},r=${randomString}`
    }));
    return {
        randomString,
        authBuffer: Buffer.concat([versionBuffer, mainBuffer, exports.NULL_BUFFER])
    };
}
exports.buildAuthBuffer = buildAuthBuffer;
function validateVersion(msg) {
    if (msg.max_protocol_version < PROTOCOL_VERSION ||
        msg.min_protocol_version > PROTOCOL_VERSION) {
        throw new error_1.RebirthDBError('Unsupported protocol version', {
            type: __1.RebirthDBErrorType.UNSUPPORTED_PROTOCOL
        });
    }
}
exports.validateVersion = validateVersion;
async function computeSaltedPassword(authentication, randomString, user, password) {
    const [randomNonce, s, i] = authentication
        .split(',')
        .map(part => part.substring(2));
    const salt = new Buffer(s, 'base64');
    const iterations = parseInt(i, 10);
    if (randomNonce.substring(0, randomString.length) !== randomString) {
        throw new error_1.RebirthDBError('Invalid nonce from server', {
            type: __1.RebirthDBErrorType.AUTH
        });
    }
    const cacheKey = `${password.toString('base64')},${salt.toString('base64')},${iterations}`;
    const saltedPassword = CACHE_PBKDF2[cacheKey] ||
        (await util_1.promisify(crypto_1.pbkdf2)(password, salt, iterations, KEY_LENGTH, 'sha256'));
    CACHE_PBKDF2[cacheKey] = saltedPassword;
    const clientFinalMessageWithoutProof = `c=biws,r=${randomNonce}`;
    const clientKey = crypto_1.createHmac('sha256', saltedPassword)
        .update('Client Key')
        .digest();
    const storedKey = crypto_1.createHash('sha256')
        .update(clientKey)
        .digest();
    const authMessage = `n=${user},r=${randomString},${authentication},${clientFinalMessageWithoutProof}`;
    const clientSignature = crypto_1.createHmac('sha256', storedKey)
        .update(authMessage)
        .digest();
    const clientProof = xorBuffer(clientKey, clientSignature);
    const serverKey = crypto_1.createHmac('sha256', saltedPassword)
        .update('Server Key')
        .digest();
    const serverSignature = crypto_1.createHmac('sha256', serverKey)
        .update(authMessage)
        .digest()
        .toString('base64');
    return {
        serverSignature,
        proof: Buffer.concat([
            Buffer.from(JSON.stringify({
                authentication: clientFinalMessageWithoutProof +
                    ',p=' +
                    clientProof.toString('base64')
            })),
            exports.NULL_BUFFER
        ])
    };
}
exports.computeSaltedPassword = computeSaltedPassword;
function compareDigest(authentication, serverSignature) {
    if (authentication.substring(authentication.indexOf('=') + 1) !==
        serverSignature) {
        throw new error_1.RebirthDBError('Invalid server signature', {
            type: __1.RebirthDBErrorType.AUTH
        });
    }
}
exports.compareDigest = compareDigest;
function xorBuffer(a, b) {
    const result = [];
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        // tslint:disable-next-line:no-bitwise
        result.push(a[i] ^ b[i]);
    }
    return new Buffer(result);
}
