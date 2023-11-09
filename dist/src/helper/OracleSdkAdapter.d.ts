import * as OracleSdk from './OracleSdk';
type JsonRpcProvider = {
    send: (method: string, params: Array<any>) => Promise<any>;
};
type Provider = JsonRpcProvider;
export declare function getBlockByNumberFactory(provider: Provider): OracleSdk.EthGetBlockByNumber;
export declare function getStorageAtFactory(provider: Provider): OracleSdk.EthGetStorageAt;
export declare function getProofFactory(provider: Provider): OracleSdk.EthGetProof;
export declare class JsonRpcError extends Error {
    readonly code: number;
    readonly data?: unknown;
    constructor(code: number, message: string, data?: unknown);
}
export {};
