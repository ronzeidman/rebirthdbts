/// <reference types="node" />
export declare const NULL_BUFFER: Buffer;
export declare function buildAuthBuffer(user: string): {
    randomString: string;
    authBuffer: Buffer;
};
export declare function validateVersion(msg: {
    max_protocol_version: number;
    min_protocol_version: number;
    server_version: string;
}): void;
export declare function computeSaltedPassword(authentication: string, randomString: string, user: string, password: Buffer): Promise<{
    serverSignature: string;
    proof: Buffer;
}>;
export declare function compareDigest(authentication: string, serverSignature: string): void;
